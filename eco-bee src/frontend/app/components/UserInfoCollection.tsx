"use client";
import React, { useState } from "react";
import {
  FaUser,
  FaUniversity,
  FaGlobeAmericas,
  FaCheck,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { Card } from "./ui";

interface UserInfo {
  name: string;
  university: string;
  saveToLeaderboard: boolean;
}

interface UserInfoCollectionProps {
  onSubmit: (userInfo: UserInfo) => void;
  onSkip: () => void;
  loading?: boolean;
}

export default function UserInfoCollection({
  onSubmit,
  onSkip,
  loading = false,
}: UserInfoCollectionProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    university: "",
    saveToLeaderboard: true,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    university?: string;
  }>({});

  const universityOptions = [
    //sourced from https://ukstudyoptions.com/a-z-list-of-uk-universities/
    "University of Aberdeen",
    "University of Abertay",
    "University of Aberystwyth",
    "Anglia Ruskin University",
    "Aston University",
    "Bangor University",
    "University of Bath",
    "Bath Spa University",
    "University of Bedfordshire",
    "University of Birmingham",
    "Birmingham City University",
    "University of Bolton",
    "Bournemouth University",
    "University of Bradford",
    "University of Brighton",
    "University of Bristol",
    "Brunel University",
    "University of Buckingham",
    "Buckinghamshire New University",
    "University of Cambridge",
    "Canterbury Christ Church University",
    "Cardiff University",
    "Cardiff University of Wales Institute (UWIC)",
    "University of Central Lancashire (UCLan)",
    "Chester University",
    "University of Chichester",
    "City St Georges University of London",
    "Coventry University",
    "Cumbria University",
    "De Montfort University",
    "University of Derby",
    "University of Dundee",
    "Durham University",
    "University of East Anglia",
    "University of East London",
    "Edge Hill University",
    "University of Edinburgh",
    "University of Essex",
    "University of Exeter",
    "University of Glamorgan",
    "University of Glasgow",
    "Glasgow Caledonian",
    "University of Gloucestershire",
    "Goldsmiths, University of London",
    "University of Greenwich",
    "Heriot Watt University",
    "University of Hertfordshire",
    "University of Huddersfield",
    "University of Hull",
    "Imperial College",
    "University of Keele",
    "University of Kent",
    "King’s College London",
    "Kingston University",
    "Lampeter, University of Wales",
    "Lancaster University",
    "University of Leeds",
    "Leeds Metropolitan University",
    "University of Leicester",
    "University of Lincoln",
    "University of Liverpool",
    "Liverpool Hope University",
    "Liverpool John Moores University",
    "London Metropolitan University",
    "London School of Economics and Political Science",
    "London South Bank University",
    "Loughborough University",
    "University of Manchester",
    "Manchester Metropolitan University",
    "Middlesex University",
    "Napier University",
    "Newcastle University",
    "University of Wales, Newport",
    "University of Northampton",
    "Northumbria University",
    "University of Nottingham",
    "Nottingham Trent University",
    "University of Oxford",
    "Oxford Brookes University",
    "University of Plymouth",
    "University of Portsmouth",
    "Queen Margaret University",
    "Queen Mary, University of London",
    "Queen’s University, Belfast",
    "University of Reading",
    "The Robert Gordon University",
    "Roehampton University",
    "Royal Holloway, University of London",
    "University of St Andrews",
    "University of Salford",
    "School of African and Oriental Studies, London",
    "University of Sheffield",
    "Sheffield Hallam University",
    "University of Southampton",
    "Southampton Solent",
    "Staffordshire University",
    "University of Stirling",
    "University of Strathclyde",
    "University of Sunderland",
    "University of Surrey",
    "University of Sussex",
    "Swansea University",
    "Swansea Metropolitan University",
    "University of Teesside",
    "Thames Valley University",
    "University of Ulster",
    "University of the Arts London",
    "University College London",
    "University of Warwick",
    "University of the West of England, Bristol",
    "University of the West of Scotland",
    "University of Westminster",
    "University of Winchester",
    "University of Wolverhampton",
    "University of Worcester",
    "University of York",
    "York St John University",

    "Other University",
    "Community Member",
    "Prefer not to say",
  ];

  const validateForm = () => {
    const newErrors: { name?: string; university?: string } = {};

    if (userInfo.saveToLeaderboard) {
      if (!userInfo.name.trim()) {
        newErrors.name = "Name is required to appear on leaderboard";
      } else if (userInfo.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }

      if (!userInfo.university.trim()) {
        newErrors.university = "University/affiliation is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(userInfo);
    }
  };

  const handleInputChange = (
    field: keyof UserInfo,
    value: string | boolean
  ) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-12">
      <Card className="max-w-3xl w-full glass">
        {/* Header */}
        <div className="glass-header text-white p-16 border-b border-white/10">
          <div className="text-center">
            <div className="icon-badge text-5xl mx-auto mb-10">
              <FaUsers className="text-green-400" />
            </div>
            <h1 className="neon-title text-5xl font-bold mb-6">Join the EcoBee Community</h1>
            <p className="text-white/70 text-2xl leading-relaxed">
              Connect with fellow sustainability enthusiasts and see how you rank on our leaderboard!
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-16 space-y-16">
          {/* Leaderboard Toggle */}
          <div className="glass-card-inner p-12 rounded-3xl border border-white/10">
            <div className="flex items-center space-x-8">
              <input
                type="checkbox"
                id="leaderboard"
                checked={userInfo.saveToLeaderboard}
                onChange={(e) =>
                  handleInputChange("saveToLeaderboard", e.target.checked)
                }
                className="w-8 h-8 rounded-xl border-2 border-white/30 bg-white/10 checked:bg-green-400 checked:border-green-400 transition-all duration-200"
              />
              <div className="space-y-4">
                <label htmlFor="leaderboard" className="text-white text-2xl font-semibold cursor-pointer">
                  Add me to the leaderboard
                </label>
                <p className="text-white/60 text-xl">
                  Share your score to inspire others
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          {userInfo.saveToLeaderboard && (
            <div className="space-y-12">
              {/* Name Field */}
              <div className="space-y-6">
                <label className="flex items-center space-x-6 text-white text-2xl font-semibold">
                  <span className="text-3xl">👤</span>
                  <span>Your Name or Pseudonym</span>
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your name or a fun pseudonym"
                  className={`w-full glass-input rounded-3xl px-8 py-6 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 text-xl font-medium border border-white/20 focus:border-green-400/60 focus:bg-white/20 transition-all duration-300 ${
                    errors.name ? "border-red-400" : ""
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-400 text-xl mt-4">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* University Field */}
              <div className="space-y-6">
                <label className="flex items-center space-x-6 text-white text-2xl font-semibold">
                  <span className="text-3xl">🏛️</span>
                  <span>University or Affiliation</span>
                </label>
                <select
                  value={userInfo.university}
                  onChange={(e) =>
                    handleInputChange("university", e.target.value)
                  }
                  className={`w-full glass-input rounded-3xl px-8 py-6 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 text-xl font-medium border border-white/20 focus:border-green-400/60 focus:bg-white/20 transition-all duration-300 bg-white/10 ${
                    errors.university ? "border-red-400" : ""
                  }`}
                  disabled={loading}
                >
                  <option value="">Select your affiliation</option>
                  <option value="university">University</option>
                  <option value="college">College</option>
                  <option value="high-school">High School</option>
                  <option value="company">Company</option>
                  <option value="organization">Organization</option>
                  <option value="other">Other</option>
                </select>
                {errors.university && (
                  <p className="text-red-400 text-xl mt-4">
                    {errors.university}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 pt-12">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary flex-1 py-6 px-10 text-2xl font-semibold rounded-3xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <span>
                  {userInfo.saveToLeaderboard
                    ? "Join Leaderboard"
                    : "Continue"}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onSkip}
              disabled={loading}
              className="btn flex-1 py-6 px-10 text-2xl font-semibold rounded-3xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              <span>Skip</span>
            </button>
          </div>

          {/* Privacy Note */}
          <div className="text-center pt-16">
            <div className="inline-flex items-center gap-4 px-8 py-12 rounded-3xl bg-white/5 border border-white/10">
              <span className="text-2xl">🔒</span>
              <span className="text-white/60 text-xl">
                Your information is used only for the leaderboard and community features
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
