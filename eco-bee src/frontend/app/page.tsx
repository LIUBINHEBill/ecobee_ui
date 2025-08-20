"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import EnhancedQuiz from "./components/EnhancedQuiz";
import EcoScoreDisplay from "./components/EcoScoreDisplay";
import Leaderboard from "./components/Leaderboard";
import SustainabilityChatbot from "./components/SustainabilityChatbot";
import ChatbotInterface from "./components/ChatbotInterface";
import UserInfoCollection from "./components/UserInfoCollection";
import { QuizResponse } from "./types/quiz";
import { BrandHeader, Bee, FeatureCard } from "./components/ui";
import {
  FaLeaf,
  FaGlobe,
  FaHeart,
  FaUsers,
  FaTrophy,
  FaComments,
  FaRobot,
  FaBarcode,
  FaCamera,
} from "react-icons/fa";
import { Card } from "./components/ui";

type AppState =
  | "welcome"
  | "quiz"
  | "userinfo"
  | "results"
  | "leaderboard"
  | "chatbot";

interface ScoringResult {
  items: any[];
  per_boundary_averages: {
    climate: number;
    biosphere: number;
    biogeochemical: number;
    freshwater: number;
    aerosols: number;
  };
  composite: number;
  grade: string;
  recommendations: Array<{
    action: string;
    impact: string;
    boundary: string;
    current_score: number;
  }>;
  boundary_details: any;
}

export default function Home() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>("welcome");
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(
    null
  );
  const [userInfo, setUserInfo] = useState<{
    name: string;
    university: string;
    saveToLeaderboard: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuizComplete = async (
    responses: QuizResponse[],
    items: any[]
  ) => {
    setLoading(true);
    setQuizResponses(responses);

    try {
      // Submit to backend for scoring
      const response = await fetch("http://localhost:8000/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_responses: responses,
          items: items,
          session_id: generateSessionId(),
          user_id: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const result = await response.json();

      if (result.scoring_result) {
        setScoringResult(result.scoring_result);
        setAppState("userinfo");
      } else {
        console.error("No scoring result received");
        // Fallback: create mock result
        setScoringResult(createMockScoringResult(responses));
        setAppState("userinfo");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      // Fallback: create mock result
      setScoringResult(createMockScoringResult(responses));
      setAppState("userinfo");
    } finally {
      setLoading(false);
    }
  };

  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const createMockScoringResult = (
    responses: QuizResponse[]
  ): ScoringResult => {
    // Simple scoring based on responses
    let totalScore = 50; // baseline

    responses.forEach((response) => {
      if (response.question_id === "food_today") {
        switch (response.answer) {
          case "plant-based":
            totalScore -= 20;
            break;
          case "mixed":
            totalScore -= 5;
            break;
          case "meat-heavy":
            totalScore += 15;
            break;
          case "packaged":
            totalScore += 10;
            break;
        }
      }
      if (response.question_id === "transport_today") {
        switch (response.answer) {
          case "walk":
          case "bike":
            totalScore -= 15;
            break;
          case "public":
            totalScore -= 5;
            break;
          case "electric":
            totalScore += 5;
            break;
          case "car":
            totalScore += 20;
            break;
        }
      }
    });

    totalScore = Math.max(0, Math.min(100, totalScore));

    const boundaryScores = {
      climate: totalScore + Math.random() * 10 - 5,
      biosphere: totalScore + Math.random() * 10 - 5,
      biogeochemical: totalScore + Math.random() * 10 - 5,
      freshwater: totalScore + Math.random() * 10 - 5,
      aerosols: totalScore + Math.random() * 10 - 5,
    };

    return {
      items: [],
      per_boundary_averages: boundaryScores,
      composite: totalScore,
      grade:
        totalScore <= 30
          ? "A"
          : totalScore <= 50
          ? "B"
          : totalScore <= 70
          ? "C"
          : "D",
      recommendations: [
        {
          action: "Choose more plant-based meals",
          impact: "Reduce climate impact by 50%",
          boundary: "Climate Change",
          current_score: boundaryScores.climate,
        },
        {
          action: "Use public transport or walk more",
          impact: "Lower your carbon footprint",
          boundary: "Climate Change",
          current_score: boundaryScores.climate,
        },
      ],
      boundary_details: {},
    };
  };

  const renderWelcome = () => (
    <main className="hero">
      <BrandHeader />

      {/* Main hero section */}
      <section className="container hero-grid" aria-labelledby="headline">
        <div>
          <h1 id="headline" className="h1">
            Make smarter everyday choices
            <br />
            with <span style={{ color: "#ffd54a" }}>EcoBee</span>
          </h1>
          <p className="sub">
            Your AI-powered sustainability coach for quick, personalized tips
            across food, mobility, and campus life. Scan products, take quizzes,
            and get insights based on planetary boundaries.
          </p>

          {/* Main CTA */}
          <button
            onClick={() => setAppState("quiz")}
            className="cta"
            aria-label="Start the 5-minute sustainability snapshot"
          >
            Start 5-minute snapshot →
          </button>

          <p className="caption" style={{ marginTop: 12 }}>
            Takes about five minutes. No guilt. Just smarter swaps.
          </p>
        </div>

        {/* Right side: Bee card */}
        <div className="c4d-card bee-wrap" aria-hidden>
          <div style={{ display: "grid", placeItems: "center" }}>
            {/* Sized to align with the left text block while being a bit larger */}
            <Bee size={"clamp(300px, 26vw, 480px)"} intrinsic />
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="container" style={{ marginTop: 80 }}>
        <h2
          className="h1"
          style={{
            fontSize: "clamp(24px, 3vw, 36px)",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Explore EcoBee Features
        </h2>

        <div className="feature-grid">
          <FeatureCard
            icon={<FaLeaf />}
            title="Sustainability Quiz"
            description="Take our planetary boundaries quiz to understand your environmental impact across key Earth systems"
            onClick={() => setAppState("quiz")}
          />

          <FeatureCard
            icon={<FaBarcode />}
            title="Product Scanner"
            description="Scan barcodes to get instant sustainability insights and eco-friendly alternatives"
            onClick={() => setAppState("quiz")}
          />

          <FeatureCard
            icon={<FaCamera />}
            title="Image Recognition"
            description="Take photos of food or clothing items to get personalized environmental impact analysis"
            onClick={() => setAppState("quiz")}
          />

          <FeatureCard
            icon={<FaRobot />}
            title="EcoChat Assistant"
            description="Ask questions about sustainability and get personalized advice from our AI coach"
            onClick={() => setAppState("chatbot")}
          />

          <FeatureCard
            icon={<FaTrophy />}
            title="EcoLeaderboard"
            description="See how your sustainability efforts compare with other students on campus"
            onClick={() => setAppState("leaderboard")}
          />

          <FeatureCard
            icon={<FaGlobe />}
            title="Planetary Boundaries"
            description="Learn about the nine planetary boundaries that define a safe operating space for humanity"
            onClick={() => setAppState("quiz")}
          />
        </div>
      </section>
    </main>
  );

  const renderQuiz = () => (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <EnhancedQuiz onComplete={handleQuizComplete} />
      </div>
    </main>
  );

  const renderResults = () => (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {scoringResult && (
          <EcoScoreDisplay
            scoringResult={scoringResult}
            onRestart={() => {
              setAppState("welcome");
              setQuizResponses([]);
              setScoringResult(null);
            }}
            onNext={() => setAppState("leaderboard")}
            onGetTips={() => setAppState("chatbot")}
          />
        )}
      </div>
    </main>
  );

  const handleUserInfoSubmit = async (userData: {
    name: string;
    university: string;
    saveToLeaderboard: boolean;
  }) => {
    setLoading(true);
    setUserInfo(userData);

    try {
      if (userData.saveToLeaderboard && scoringResult) {
        // Submit to leaderboard
        const response = await fetch("http://localhost:8000/api/submit-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: generateSessionId(),
            pseudonym: userData.name,
            composite_score: scoringResult.composite,
            boundary_scores: scoringResult.per_boundary_averages,
            campus_affiliation: userData.university,
            quiz_responses: quizResponses,
          }),
        });

        if (!response.ok) {
          console.error("Failed to submit to leaderboard");
        } else {
          console.log("Successfully added to leaderboard");
        }
      }
    } catch (error) {
      console.error("Error submitting user info:", error);
    } finally {
      setLoading(false);
      setAppState("results");
    }
  };

  const handleUserInfoSkip = () => {
    setUserInfo({
      name: "",
      university: "",
      saveToLeaderboard: false,
    });
    setAppState("results");
  };

  const renderLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full mx-auto">
        <div className="glass-header p-8 border-b border-white/10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="icon-badge">
              <span className="text-4xl">🌱</span>
            </div>
            <h2 className="text-3xl neon-title">Calculating Your EcoScore</h2>
          </div>
        </div>
        
        <div className="p-12 text-center">
          <div className="glass-card-inner p-8 rounded-2xl mb-8">
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Analyzing your responses across planetary boundaries...
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
              <span className="text-lg text-yellow-400 font-semibold">Please wait</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="glass-card-inner p-6 rounded-xl">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Planetary Boundaries</h3>
              <p className="text-sm text-white/70">Analyzing your impact across Earth's systems</p>
            </div>
            
            <div className="glass-card-inner p-6 rounded-xl">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Processing</h3>
              <p className="text-sm text-white/70">Calculating your sustainability metrics</p>
            </div>
            
            <div className="glass-card-inner p-6 rounded-xl">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">Score Generation</h3>
              <p className="text-sm text-white/70">Creating your personalized EcoScore</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  if (loading) return renderLoading();

  switch (appState) {
    case "welcome":
      return renderWelcome();
    case "quiz":
      return renderQuiz();
    case "userinfo":
      return (
        <UserInfoCollection
          onSubmit={handleUserInfoSubmit}
          onSkip={handleUserInfoSkip}
          loading={loading}
        />
      );
    case "results":
      return renderResults();
    case "leaderboard":
      return <Leaderboard onBack={() => setAppState("welcome")} />;
    case "chatbot":
      return (
        <main className="min-h-screen p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <ChatbotInterface
              onClose={() => setAppState("welcome")}
              quizResponses={quizResponses}
              scoringResult={scoringResult}
            />
          </div>
        </main>
      );
    default:
      return renderWelcome();
  }
}
