"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  FaLeaf,
  FaGlobe,
  FaWater,
  FaWind,
  FaRecycle,
  FaArrowRight,
  FaArrowLeft,
  FaTrophy,
  FaLightbulb,
  FaShareAlt,
  FaComments,
} from "react-icons/fa";

interface BoundaryScore {
  climate: number;
  biosphere: number;
  biogeochemical: number;
  freshwater: number;
  aerosols: number;
}

interface Recommendation {
  action: string;
  impact: string;
  boundary: string;
  current_score: number;
}

interface ScoringResult {
  items: any[];
  per_boundary_averages: BoundaryScore;
  composite: number;
  grade: string;
  recommendations: Recommendation[];
  boundary_details: any;
}

interface EcoScoreDisplayProps {
  scoringResult: ScoringResult;
  onRestart: () => void;
  onNext?: () => void;
  onGetTips?: () => void;
}

const BOUNDARY_ICONS = {
  climate: {
    icon: FaGlobe,
    color: "text-red-500",
    bg: "bg-red-100",
    name: "Climate Change",
  },
  biosphere: {
    icon: FaLeaf,
    color: "text-green-500",
    bg: "bg-green-100",
    name: "Biosphere Integrity",
  },
  biogeochemical: {
    icon: FaRecycle,
    color: "text-blue-500",
    bg: "bg-blue-100",
    name: "Biogeochemical Flows",
  },
  freshwater: {
    icon: FaWater,
    color: "text-cyan-500",
    bg: "bg-cyan-100",
    name: "Freshwater Use",
  },
  aerosols: {
    icon: FaWind,
    color: "text-gray-500",
    bg: "bg-gray-100",
    name: "Aerosols & Novel Entities",
  },
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case "A+":
    case "A":
      return "text-green-600 bg-green-100";
    case "B+":
    case "B":
      return "text-blue-600 bg-blue-100";
    case "C+":
    case "C":
      return "text-yellow-600 bg-yellow-100";
    case "D":
      return "text-orange-600 bg-orange-100";
    default:
      return "text-red-600 bg-red-100";
  }
};

const getScoreColor = (score: number) => {
  if (score <= 30) return "text-green-600";
  if (score <= 50) return "text-yellow-600";
  if (score <= 70) return "text-orange-600";
  return "text-red-600";
};

export default function EcoScoreDisplay({
  scoringResult,
  onRestart,
  onNext,
  onGetTips,
}: EcoScoreDisplayProps) {
  const router = useRouter();

  const boundaryScores = Object.entries(
    scoringResult.per_boundary_averages
  ).map(([key, value]) => ({
    key,
    value: Math.round(value),
    ...BOUNDARY_ICONS[key as keyof typeof BOUNDARY_ICONS],
  }));

  const createRadialScore = (score: number) => {
    const circumference = 2 * Math.PI * 35; // radius of 35 to match the circle
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    return { strokeDasharray, strokeDashoffset };
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My EcoBee Environmental Score",
        text: `I scored ${scoringResult.grade} (${scoringResult.composite}/100) on my environmental impact assessment!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `I scored ${scoringResult.grade} (${scoringResult.composite}/100) on my environmental impact assessment! Check out EcoBee: ${window.location.href}`
      );
      alert("Score copied to clipboard!");
    }
  };

  // Get progress bar width class
  const getProgressBarClass = (value: number) => {
    const width = Math.max(5, 100 - value);
    if (width >= 90) return "w-full";
    if (width >= 80) return "w-5/6";
    if (width >= 75) return "w-3/4";
    if (width >= 60) return "w-3/5";
    if (width >= 50) return "w-1/2";
    if (width >= 40) return "w-2/5";
    if (width >= 33) return "w-1/3";
    if (width >= 25) return "w-1/4";
    if (width >= 20) return "w-1/5";
    if (width >= 16) return "w-1/6";
    return "w-1/12";
  };

  return (
    <div className="max-w-4xl mx-auto glass rounded-2xl overflow-hidden relative">
      {/* Main Content */}
      <div className="glass-header text-white p-6">
        {/* Total Score - Large and Prominent */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <svg className="w-3 h-3 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Score circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke={
                    scoringResult.composite <= 30
                      ? "#10b981"
                      : scoringResult.composite <= 60
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={
                    createRadialScore(100 - scoringResult.composite).strokeDasharray
                  }
                  strokeDashoffset={
                    createRadialScore(100 - scoringResult.composite)
                      .strokeDashoffset
                  }
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <div
                  className={`text-xs font-bold ${getScoreColor(
                    scoringResult.composite
                  )}`}
                >
                  {Math.round(100 - scoringResult.composite)}
                </div>
                <div
                  className={`text-xs font-bold px-1 py-0.5 rounded-full ${getGradeColor(
                    scoringResult.grade
                  )}`}
                >
                  {scoringResult.grade}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <FaTrophy className="mx-auto text-3xl mb-3 opacity-90" />
          <h1 className="text-3xl font-bold mb-2">Your EcoBee Score</h1>
          <p className="text-white/70 text-lg">
            Environmental Impact Assessment
          </p>
        </div>
      </div>

      {/* Boundary Breakdown */}
      <div className="py-2 px-3 border-b border-white/10">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center">
          <FaGlobe className="mr-2 text-yellow-400" />
          Planetary Boundary Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {boundaryScores.map(({ key, value, icon: Icon, color, bg, name }) => (
            <div key={key} className={`p-3 rounded-xl glass-card-inner`}>
              <div className="flex items-center justify-between mb-1">
                <Icon className={`text-xl text-white`} />
                <span className={`text-xl font-bold ${getScoreColor(value)} text-white`}>
                  {Math.round(100 - value)}
                </span>
              </div>
              <h3 className="font-semibold text-white text-xs">{name}</h3>
              <div className="mt-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    value <= 30
                      ? "bg-green-400"
                      : value <= 60
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  } ${getProgressBarClass(value)}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {scoringResult.recommendations &&
        scoringResult.recommendations.length > 0 && (
          <div className="py-2 px-3 border-b border-white/10">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center">
              <FaLightbulb className="mr-2 text-yellow-400" />
              Your Top Improvement Actions
            </h2>

            <div className="space-y-2">
              {scoringResult.recommendations.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className="glass-card-inner"
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-white/20 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-base mb-1">
                        {rec.action}
                      </h3>
                      <p className="text-white/70 mb-1 text-sm">{rec.impact}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-yellow-300 bg-white/10 px-2 py-0.5 rounded-full">
                          {rec.boundary}
                        </span>
                        <span className="text-xs text-white/60">
                          Current score: {Math.round(100 - rec.current_score)}
                          /100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Action Buttons */}
      <div className="py-6 px-6">
        <div className="space-y-4">
          {/* First Row - Take Again, Share Results, and Leaderboard */}
          <div className="flex gap-4">
            <button
              onClick={onRestart}
              className="btn flex-1 flex items-center justify-center gap-2 py-3"
            >
              <FaArrowLeft />
              <span>Take Again</span>
            </button>

            <button
              onClick={handleShare}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <FaShareAlt />
              <span>Share Results</span>
            </button>

            {onNext && (
              <button onClick={onNext} className="btn btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                <span>Leaderboard</span>
                <FaArrowRight />
              </button>
            )}
          </div>

          {/* Second Row - Get Tips Button Only */}
          {onGetTips && (
            <button onClick={onGetTips} className="btn btn-primary w-full flex items-center justify-center gap-2 py-3">
              <FaComments />
              <span>Get Tips</span>
            </button>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-white/60">
            Want to improve your score? Check back regularly and track your
            progress!
          </p>
        </div>
      </div>
    </div>
  );
}
