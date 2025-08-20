"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaLeaf,
  FaUtensils,
  FaTshirt,
  FaCar,
  FaBicycle,
  FaWater,
  FaRecycle,
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaStar,
  FaImage,
} from "react-icons/fa";
import {
  QUIZ_QUESTIONS,
  QuizResponse,
  QuizState,
  createQuizResponse,
  validateQuizResponse,
} from "../types/quiz";
import BarcodeScanner from "./BarcodeScanner";
import { Bee, Card } from "./ui";

interface EnhancedQuizProps {
  onComplete: (responses: QuizResponse[], items: any[]) => void;
}

export default function EnhancedQuiz({ onComplete }: EnhancedQuizProps) {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    responses: [],
    isComplete: false,
    capturedItems: [],
  });

  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showImageCapture, setShowImageCapture] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<any>(null);

  const currentQuestion = QUIZ_QUESTIONS[quizState.currentQuestionIndex];
  const isLastQuestion =
    quizState.currentQuestionIndex === QUIZ_QUESTIONS.length - 1;
  const progress = Math.round(
    ((quizState.currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "food":
        return <FaUtensils className="text-green-600" />;
      case "clothing":
        return <FaTshirt className="text-blue-600" />;
      case "transport":
        return <FaCar className="text-purple-600" />;
      case "lifestyle":
        return <FaLeaf className="text-emerald-600" />;
      case "reflection":
        return <FaStar className="text-yellow-600" />;
      default:
        return <FaLeaf className="text-gray-600" />;
    }
  };

  const handleAnswerChange = useCallback((value: any) => {
    setCurrentAnswer(value);
    setErrors(null);
  }, []);

  const handleNext = useCallback(() => {
    if (!currentQuestion) return;

    // Validate answer
    const validationError = validateQuizResponse(
      currentQuestion,
      currentAnswer
    );
    if (validationError) {
      setErrors(validationError);
      return;
    }

    // Create response
    const response = createQuizResponse(currentQuestion, currentAnswer);

    // Update quiz state
    setQuizState((prev) => {
      const newResponses = [...prev.responses];
      const existingIndex = newResponses.findIndex(
        (r) => r.question_id === response.question_id
      );

      if (existingIndex >= 0) {
        newResponses[existingIndex] = response;
      } else {
        newResponses.push(response);
      }

      const newIndex = prev.currentQuestionIndex + 1;
      const isComplete = newIndex >= QUIZ_QUESTIONS.length;

      if (isComplete) {
        // Quiz completed
        // onComplete will be called in useEffect
        return { ...prev, responses: newResponses, isComplete: true };
      }

      return {
        ...prev,
        responses: newResponses,
        currentQuestionIndex: newIndex,
      };
    });

    // Reset current answer for next question
    setCurrentAnswer(null);
  }, [currentQuestion, currentAnswer, onComplete]);

  // Call onComplete only after render, when isComplete becomes true
  useEffect(() => {
    if (quizState.isComplete) {
      onComplete(quizState.responses, quizState.capturedItems);
    }
  }, [
    quizState.isComplete,
    quizState.responses,
    quizState.capturedItems,
    onComplete,
  ]);

  const handlePrevious = useCallback(() => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));

      // Load previous answer
      const prevQuestion = QUIZ_QUESTIONS[quizState.currentQuestionIndex - 1];
      const prevResponse = quizState.responses.find(
        (r) => r.question_id === prevQuestion.id
      );
      setCurrentAnswer(prevResponse?.answer || null);
    }
  }, [quizState.currentQuestionIndex, quizState.responses]);

  const handleBarcodeCapture = useCallback(
    (barcode: string, productInfo: any, fullResult: any = null) => {
      console.log("Barcode capture result:", {
        barcode,
        productInfo,
        fullResult,
      });

      // Extract sustainability information
      const sustainability = fullResult?.sustainability;
      const productDetails = fullResult?.product_details;

      // Get product name from multiple possible sources
      const productName =
        productInfo?.name ||
        productDetails?.name ||
        sustainability?.name ||
        "Unknown Product";
      console.log("Product name:", productName);

      // Determine category and auto-select quiz answer
      const detectedCategory =
        productInfo?.category || sustainability?.category || "unknown";
      console.log("Detected category:", detectedCategory);

      // Auto-select appropriate quiz answer based on product type
      if (currentQuestion?.id === "food_today") {
        let autoAnswer = null;

        // Check product name for snack/candy/processed food keywords
        const nameCheck = productName.toLowerCase();
        const categoryCheck = detectedCategory.toLowerCase();

        console.log("Checking product name:", nameCheck);
        console.log("Checking category:", categoryCheck);

        // Map product categories to quiz answers - check both name and category
        if (
          categoryCheck.includes("snack") ||
          categoryCheck.includes("packaged") ||
          categoryCheck.includes("processed") ||
          categoryCheck.includes("processed/packaged") ||
          nameCheck.includes("crisp") ||
          nameCheck.includes("candy") ||
          nameCheck.includes("chocolate") ||
          nameCheck.includes("tangfastics") ||
          nameCheck.includes("sweet") ||
          nameCheck.includes("biscuit") ||
          nameCheck.includes("cookie") ||
          categoryCheck.includes("confectioneries") ||
          categoryCheck.includes("candies")
        ) {
          autoAnswer = "packaged"; // Fixed: correct value is "packaged" not "processed-packaged"
        } else if (
          categoryCheck.includes("plant") ||
          categoryCheck.includes("vegetable") ||
          categoryCheck.includes("fruit") ||
          categoryCheck.includes("organic")
        ) {
          autoAnswer = "plant-based";
        } else if (
          categoryCheck.includes("meat") ||
          categoryCheck.includes("beef") ||
          categoryCheck.includes("chicken") ||
          categoryCheck.includes("pork")
        ) {
          autoAnswer = "meat-heavy";
        } else if (
          categoryCheck.includes("mixed") ||
          categoryCheck.includes("dairy")
        ) {
          autoAnswer = "mixed";
        }

        console.log("Auto-answer selected:", autoAnswer);

        if (autoAnswer) {
          console.log("Calling handleAnswerChange with:", autoAnswer);
          handleAnswerChange(autoAnswer);
        } else {
          console.log("No auto-answer found for category:", detectedCategory);
        }
      }

      const item = {
        type: currentQuestion.category === "food" ? "food" : "clothing",
        category: detectedCategory,
        materials: productInfo?.materials || sustainability?.ingredients || [],
        barcode: barcode,
        confidence: productInfo?.confidence || 0.9,
        source: "barcode",
        // Store comprehensive sustainability data for results page
        sustainabilityData: sustainability
          ? {
              name: sustainability.name,
              brand: sustainability.brand,
              category: sustainability.category,
              description: sustainability.description,
              ingredients: sustainability.ingredients,
              sustainability_score: sustainability.sustainability_score,
              eco_rating: sustainability.eco_rating,
              environmental_tips: sustainability.environmental_tips,
              alternatives: sustainability.alternatives,
              certifications:
                sustainability.sustainability_score?.certifications || [],
              improvement_suggestions:
                sustainability.sustainability_score?.improvement_suggestions ||
                [],
              // Additional detailed metrics for results page
              detailed_scores: {
                overall_score:
                  sustainability.sustainability_score?.overall_score || 50,
                environmental_impact:
                  sustainability.sustainability_score?.environmental_impact ||
                  50,
                carbon_footprint:
                  sustainability.sustainability_score?.carbon_footprint || 50,
                packaging_score:
                  sustainability.sustainability_score?.packaging_score || 50,
                recyclability:
                  sustainability.sustainability_score?.recyclability || 50,
                ethical_sourcing:
                  sustainability.sustainability_score?.ethical_sourcing || 50,
              },
              // Planetary boundary impact breakdown
              boundary_impacts: {
                climate:
                  sustainability.sustainability_score?.carbon_footprint || 50,
                biosphere:
                  sustainability.sustainability_score?.environmental_impact ||
                  50,
                biogeochemical:
                  sustainability.sustainability_score?.packaging_score || 50,
                freshwater:
                  sustainability.sustainability_score?.environmental_impact ||
                  50,
                aerosols:
                  sustainability.sustainability_score?.environmental_impact ||
                  50,
              },
            }
          : null,
        productDetails: productDetails,
        productInfo: productInfo,
      };

      setQuizState((prev) => ({
        ...prev,
        capturedItems: [...prev.capturedItems, item],
      }));

      // Show success message with product name
      const scannedProductName =
        productInfo?.name ||
        productDetails?.name ||
        sustainability?.name ||
        "Product";
      setScannedProduct({
        name: scannedProductName,
        category: detectedCategory,
        sustainability: sustainability,
        barcode: barcode,
      });

      setShowBarcode(false);
    },
    [currentQuestion, handleAnswerChange]
  );

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "single":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswerChange(option.value)}
                className={`option-button ${
                  currentAnswer === option.value ? "selected" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {option.icon && <span className="text-xl">{option.icon}</span>}
                    <div>
                      <div className="text-[18px] font-semibold tracking-wide">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-white/70 mt-1 leading-relaxed">{option.description}</div>
                      )}
                    </div>
                  </div>
                  {currentAnswer === option.value && <FaCheck className="text-yellow-400" />}
                </div>
              </button>
            ))}
          </div>
        );

      case "multiple":
        const multipleAnswers = Array.isArray(currentAnswer)
          ? currentAnswer
          : [];
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => {
              const isSelected = multipleAnswers.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    const newAnswers = isSelected
                      ? multipleAnswers.filter((a) => a !== option.value)
                      : [...multipleAnswers, option.value];
                    handleAnswerChange(newAnswers);
                  }}
                  className={`option-button ${isSelected ? "selected" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? "border-yellow-400 bg-yellow-400" : "border-white/30"}`}
                      >
                        {isSelected && <FaCheck className="text-black text-xs" />}
                      </div>
                      <span className="font-medium tracking-wide">{option.label}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case "scale":
        return (
          <div className="space-y-4">
            <div className="scale-options-container">
              {Array.from(
                { length: currentQuestion.scaleMax || 5 },
                (_, i) => i + 1
              ).map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswerChange(value)}
                  className={`scale-option ${
                    currentAnswer === value ? "selected" : ""
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-6">
            <textarea
              value={currentAnswer || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              rows={8}
              className="w-4/5 max-w-4xl p-6 glass-input rounded-2xl resize-none text-lg leading-relaxed min-h-48"
              style={{
                fontSize: '18px',
                lineHeight: '1.6',
                fontFamily: 'inherit'
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (quizState.isComplete) {
    return (
      <Card className="max-w-3xl mx-auto ml-8">
        <div className="glass-header p-8 border-b border-white/10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="icon-badge">
              <span className="text-4xl">🌱</span>
            </div>
            <h2 className="text-3xl neon-title">Quiz Complete!</h2>
          </div>
        </div>
        
        <div className="p-12 text-center">
          <div className="glass-card-inner p-8 rounded-2xl mb-8">
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Thank you for sharing your environmental snapshot. We're calculating
              your EcoScore...
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
              <span className="text-lg text-yellow-400 font-semibold">Processing...</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto ml-8">
      {/* Header with bee mascot */}
      <div className="glass-header p-6 border-b border-white/10" style={{ paddingBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="icon-badge"><span>🐝</span></div>
            <h1 className="text-xl neon-title">EcoBee Quiz</h1>
          </div>
          {/* right side intentionally left clean for a calmer header */}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Compact metrics row with comfortable spacing */}
        <div className="mt-3 text-sm text-white/70" style={{ display: "flex", alignItems: "center", gap: 16, fontWeight: 600, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
          <span>{progress}% Complete</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>
            Question {quizState.currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Question content */}
      <div className="p-8 pl-16">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, marginBottom: 24 }}>
          <div className="icon-badge">{getCategoryIcon(currentQuestion.category)}</div>
          <h2 className="text-2xl neon-title" style={{ margin: 0 }}>
            {currentQuestion.text}
          </h2>
        </div>

        {/* Scanned Product Display */}
        {scannedProduct && (
          <div className="mb-6 p-4 glass-card-inner border border-green-400/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-300">
                ✅ Scanned: {scannedProduct.name}
              </h3>
              <button
                onClick={() => setScannedProduct(null)}
                className="text-green-300 hover:text-green-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Brand and Category */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="font-medium text-green-200">Brand:</span>
                <div className="text-green-300">
                  {scannedProduct.sustainability?.brand || "Unknown"}
                </div>
              </div>
              <div>
                <span className="font-medium text-green-200">Category:</span>
                <div className="text-green-300">{scannedProduct.category}</div>
              </div>
            </div>

            {/* Sustainability Scores */}
            {scannedProduct.sustainability?.sustainability_score && (
              <div className="mb-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-green-600">
                      {Math.round(
                        scannedProduct.sustainability.sustainability_score
                          .overall_score
                      )}
                      /100
                    </div>
                    <div className="text-gray-600">Overall</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-blue-600">
                      {Math.round(
                        scannedProduct.sustainability.sustainability_score
                          .environmental_impact
                      )}
                      /100
                    </div>
                    <div className="text-gray-600">Environmental</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-orange-600">
                      {Math.round(
                        scannedProduct.sustainability.sustainability_score
                          .carbon_footprint
                      )}
                      /100
                    </div>
                    <div className="text-gray-600">Carbon</div>
                  </div>
                </div>
              </div>
            )}

            {/* Eco Rating */}
            {scannedProduct.sustainability?.eco_rating && (
              <div className="mb-3 p-2 bg-white rounded border">
                <span className="font-medium text-green-700">Rating:</span>
                <span className="ml-2 text-green-600 font-semibold">
                  {scannedProduct.sustainability.eco_rating}
                </span>
              </div>
            )}

            {/* Key Ingredients (first 3) */}
            {scannedProduct.sustainability?.ingredients &&
              scannedProduct.sustainability.ingredients.length > 0 && (
                <div className="mb-3">
                  <span className="font-medium text-green-700 text-sm">
                    Key Ingredients:
                  </span>
                  <div className="text-xs text-green-600 mt-1">
                    {scannedProduct.sustainability.ingredients
                      .slice(0, 3)
                      .join(", ")}
                    {scannedProduct.sustainability.ingredients.length > 3 &&
                      "..."}
                  </div>
                </div>
              )}

            {/* Environmental Tips (first 2) */}
            {scannedProduct.sustainability?.environmental_tips &&
              scannedProduct.sustainability.environmental_tips.length > 0 && (
                <div className="mb-3">
                  <span className="font-medium text-green-700 text-sm">
                    💡 Tips:
                  </span>
                  <ul className="text-xs text-green-600 mt-1 space-y-1">
                    {scannedProduct.sustainability.environmental_tips
                      .slice(0, 2)
                      .map((tip: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

            <div className="mt-2 text-xs text-green-600 flex items-center justify-between">
              <span>✓ Quiz answer auto-selected: "Processed/Packaged"</span>
              <span className="text-gray-500">
                Detailed analysis saved for results
              </span>
            </div>
          </div>
        )}

        {/* Special features for certain questions */}
        {(currentQuestion.category === "food" ||
          currentQuestion.category === "clothing") && (
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => setShowBarcode(true)}
              className="btn"
            >
              <FaImage />
              <span>Scan Barcode</span>
            </button>
            <button
              onClick={() => setShowImageCapture(true)}
              className="btn"
            >
              <FaImage />
              <span>Take Photo</span>
            </button>
          </div>
        )}

        {/* Question input */}
        {renderQuestionInput()}

        {/* Error message */}
        {errors && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{errors}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button
            onClick={handlePrevious}
            disabled={quizState.currentQuestionIndex === 0}
            className="btn"
          >
            <FaArrowLeft />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!currentAnswer || 
                     (Array.isArray(currentAnswer) && currentAnswer.length === 0) ||
                     (typeof currentAnswer === 'string' && currentAnswer.trim() === '')}
            className="btn btn-primary"
          >
            <span>{isLastQuestion ? "Complete" : "Next"}</span>
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Barcode scanner modal */}
      {showBarcode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl max-w-md w-full overflow-hidden">
            <div className="glass-header p-4 border-b border-white/10">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setShowBarcode(false)}
                  className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <BarcodeScanner
                onBarcodeDetected={handleBarcodeCapture}
                onClose={() => setShowBarcode(false)}
                productType={
                  currentQuestion.category === "food" ? "food" : "clothing"
                }
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
