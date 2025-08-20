"use client";
import React, { useState, useRef, useCallback } from "react";
import {
  FaCamera,
  FaUpload,
  FaBarcode,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

interface BarcodeResult {
  success: boolean;
  barcode: string | null;
  product_info: {
    name?: string;
    brand?: string;
    category?: string;
    sustainability_indicators?: string[];
    barcode_type?: string;
    confidence?: number;
  } | null;
  product_details: {
    name?: string;
    brand?: string;
    category?: string;
    description?: string;
    ingredients?: string[];
  } | null;
  sustainability: {
    name?: string;
    brand?: string;
    category?: string;
    description?: string;
    ingredients?: string[];
    sustainability_score: {
      overall_score: number;
      environmental_impact: number;
      carbon_footprint: number;
      packaging_score: number;
      recyclability: number;
      ethical_sourcing: number;
      certifications: string[];
      improvement_suggestions: string[];
    };
    eco_rating: string;
    environmental_tips: string[];
    alternatives: Array<{
      name: string;
      reason: string;
    }>;
  } | null;
  detected: boolean;
  error?: string;
}

interface BarcodeScannerProps {
  onBarcodeDetected: (
    barcode: string,
    productInfo: any,
    fullResult?: any
  ) => void;
  onClose: () => void;
  productType?: string; // "food" or "clothing"
}

export default function BarcodeScanner({
  onBarcodeDetected,
  onClose,
  productType = "food",
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setIsScanning(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Could not access camera. Please ensure camera permissions are granted."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  }, [stream]);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        try {
          await scanImage(blob);
        } finally {
          setLoading(false);
        }
      },
      "image/jpeg",
      0.8
    );
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setLoading(true);
      try {
        await scanImage(file);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const scanImage = async (imageBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("image", imageBlob);
      formData.append("product_type", productType);

      const response = await fetch("http://localhost:8000/api/scan-barcode", {
        method: "POST",
        body: formData,
      });

      const result: BarcodeResult = await response.json();
      console.log("BarcodeScanner received result:", result);
      setResult(result);

      if (result.success && result.barcode) {
        console.log("Calling onBarcodeDetected with:", {
          barcode: result.barcode,
          productInfo: result.product_info,
          fullResult: result,
        });
        onBarcodeDetected(result.barcode, result.product_info, result);
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      setResult({
        success: false,
        barcode: null,
        product_info: null,
        product_details: null,
        sustainability: null,
        detected: false,
        error: "Failed to scan barcode. Please try again.",
      });
    }
  };

  const reset = () => {
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with icon and title */}
      <div className="barcode-header mb-4">
        <div className="icon-badge">
          <FaBarcode className="text-lg" />
        </div>
        <h3 className="text-lg neon-title">Barcode Scanner</h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-yellow-400 mr-3" />
          <span className="text-white/80">Processing...</span>
        </div>
      )}

      {!isScanning && !result && !loading && (
        <div className="space-y-6">
          <p className="text-white/70 text-center leading-relaxed">
            Scan a barcode using your camera or upload an image
          </p>

          <div className="space-y-4">
            <button
              onClick={startCamera}
              className="w-full btn btn-primary flex items-center justify-center gap-3 py-4"
            >
              <FaCamera className="text-lg" />
              <span>Use Camera</span>
            </button>

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                title="Upload barcode image"
                placeholder="Choose an image file"
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full btn flex items-center justify-center gap-3 py-4"
              >
                <FaUpload className="text-lg" />
                <span>Upload Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="space-y-6">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full rounded-xl"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white/80 rounded-xl w-48 h-32 relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-400"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-400"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-400"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-400"></div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={captureImage}
              disabled={loading}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-3"
            >
              <FaCamera />
              <span>Capture</span>
            </button>
            <button
              onClick={stopCamera}
              className="flex-1 btn flex items-center justify-center gap-2 py-3"
            >
              <span>Cancel</span>
            </button>
          </div>

          <p className="text-sm text-white/60 text-center">
            Position the barcode within the frame and tap Capture
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {result.success && result.detected ? (
            <div className="space-y-6">
              {/* Basic Product Information */}
              <div className="glass-card-inner">
                <h4 className="font-semibold text-green-300 mb-4 flex items-center gap-2">
                  🛒 Product Detected!
                </h4>

                {result.barcode && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-white/70">
                      Barcode:{" "}
                    </span>
                    <span className="font-mono text-sm glass-card-inner px-3 py-2 rounded-lg">
                      {result.barcode}
                    </span>
                  </div>
                )}

                {(result.product_details || result.product_info) && (
                  <div className="space-y-3 text-sm">
                    {(result.product_details?.name ||
                      result.product_info?.name) && (
                      <div>
                        <span className="font-medium text-white/70">
                          Product:{" "}
                        </span>
                        <span className="text-white">
                          {result.product_details?.name ||
                            result.product_info?.name}
                        </span>
                      </div>
                    )}

                    {(result.product_details?.brand ||
                      result.product_info?.brand) && (
                      <div>
                        <span className="font-medium text-white/70">
                          Brand:{" "}
                        </span>
                        <span className="text-white">
                          {result.product_details?.brand ||
                            result.product_info?.brand}
                        </span>
                      </div>
                    )}

                    {(result.product_details?.category ||
                      result.product_info?.category) && (
                      <div>
                        <span className="font-medium text-white/70">
                          Category:{" "}
                        </span>
                        <span className="text-white">
                          {result.product_details?.category ||
                            result.product_info?.category}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sustainability Information */}
              {result.sustainability && (
                <div className="glass-card-inner">
                  <h4 className="font-semibold text-blue-300 mb-4 flex items-center gap-2">
                    🌱 Sustainability Analysis
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        result.sustainability.eco_rating === "Excellent"
                          ? "bg-green-400/20 text-green-300 border border-green-400/30"
                          : result.sustainability.eco_rating === "Good"
                          ? "bg-blue-400/20 text-blue-300 border border-blue-400/30"
                          : result.sustainability.eco_rating === "Fair"
                          ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                          : "bg-red-400/20 text-red-300 border border-red-400/30"
                      }`}
                    >
                      {result.sustainability.eco_rating}
                    </span>
                  </h4>

                  {/* Sustainability Scores */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="text-center p-3 glass-card-inner rounded-xl">
                      <div className="text-lg font-bold text-green-400">
                        {Math.round(
                          result.sustainability.sustainability_score
                            .overall_score
                        )}
                      </div>
                      <div className="text-xs text-white/60">
                        Overall Score
                      </div>
                    </div>
                    <div className="text-center p-3 glass-card-inner rounded-xl">
                      <div className="text-lg font-bold text-blue-400">
                        {Math.round(
                          result.sustainability.sustainability_score
                            .environmental_impact
                        )}
                      </div>
                      <div className="text-xs text-white/60">
                        Environmental
                      </div>
                    </div>
                    <div className="text-center p-3 glass-card-inner rounded-xl">
                      <div className="text-lg font-bold text-orange-400">
                        {Math.round(
                          result.sustainability.sustainability_score
                            .carbon_footprint
                        )}
                      </div>
                      <div className="text-xs text-white/60">Carbon</div>
                    </div>
                    <div className="text-center p-3 glass-card-inner rounded-xl">
                      <div className="text-lg font-bold text-purple-400">
                        {Math.round(
                          result.sustainability.sustainability_score
                            .recyclability
                        )}
                      </div>
                      <div className="text-xs text-white/60">Recyclable</div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {result.sustainability.sustainability_score.certifications
                    ?.length > 0 && (
                    <div className="mb-4">
                      <span className="font-medium text-blue-300 text-sm">
                        Certifications:{" "}
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.sustainability.sustainability_score.certifications.map(
                          (cert, index) => (
                            <span
                              key={index}
                              className="bg-blue-400/20 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-400/30"
                            >
                              {cert}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Environmental Tips */}
                  {result.sustainability.environmental_tips?.length > 0 && (
                    <div className="mb-4">
                      <span className="font-medium text-blue-300 text-sm block mb-3">
                        💡 Environmental Tips:
                      </span>
                      <ul className="text-sm text-white/80 space-y-2">
                        {result.sustainability.environmental_tips
                          .slice(0, 2)
                          .map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-400 mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Sustainable Alternatives */}
                  {result.sustainability.alternatives?.length > 0 && (
                    <div>
                      <span className="font-medium text-blue-300 text-sm block mb-3">
                        🔄 Better Alternatives:
                      </span>
                      <div className="space-y-3">
                        {result.sustainability.alternatives
                          .slice(0, 2)
                          .map((alt, index) => (
                            <div
                              key={index}
                              className="glass-card-inner p-3 rounded-xl"
                            >
                              <div className="font-medium text-blue-300">
                                {alt.name}
                              </div>
                              <div className="text-white/80 text-sm">
                                {alt.reason}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Legacy compatibility for basic product info */}
              {!result.sustainability && result.product_info && (
                <div className="glass-card-inner">
                  <h4 className="font-semibold text-white mb-3">
                    Basic Product Info
                  </h4>

                  {result.product_info.sustainability_indicators &&
                    result.product_info.sustainability_indicators.length >
                      0 && (
                      <div>
                        <span className="font-medium text-white/70 text-sm">
                          Eco Labels:{" "}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.product_info.sustainability_indicators.map(
                            (indicator, index) => (
                              <span
                                key={index}
                                className="bg-green-400/20 text-green-300 px-3 py-1 rounded-full text-xs border border-green-400/30"
                              >
                                {indicator}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {result.product_info.confidence && (
                    <div className="mt-3">
                      <span className="font-medium text-white/70 text-sm">
                        Confidence:{" "}
                      </span>
                      <span className="text-sm text-white">
                        {Math.round(result.product_info.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card-inner">
              <h4 className="font-semibold text-yellow-300 mb-3">
                No Barcode Detected
              </h4>
              <p className="text-sm text-white/70">
                {result.error ||
                  "Could not detect a barcode in this image. Please try again with a clearer image."}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-3"
            >
              <span>Scan Another</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 btn flex items-center justify-center gap-2 py-3"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
