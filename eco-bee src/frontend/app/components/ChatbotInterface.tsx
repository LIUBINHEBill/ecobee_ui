"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaLeaf, FaTimes } from "react-icons/fa";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotInterfaceProps {
  onClose?: () => void;
  quizResponses?: any[];
  scoringResult?: any;
}

export default function ChatbotInterface({
  onClose,
  quizResponses,
  scoringResult,
}: ChatbotInterfaceProps) {
  const generatePersonalizedWelcome = () => {
    if (scoringResult) {
      const grade = scoringResult.grade;
      const score = Math.round(scoringResult.composite);
      let encouragement = "";

      if (score >= 80) {
        encouragement =
          "Excellent work! 🌟 You're already making great sustainable choices.";
      } else if (score >= 60) {
        encouragement =
          "Good job! 👍 You're on the right track with sustainability.";
      } else if (score >= 40) {
        encouragement =
          "You're making progress! 💪 There's room for improvement.";
      } else {
        encouragement =
          "Every journey starts with a first step! 🌱 Let's work together to improve your sustainability.";
      }

      return `Hi! I'm EcoBee, your personal sustainability coach! 🐝 

I've reviewed your quiz results - you scored ${score}/100 (Grade: ${grade}). ${encouragement}

I'm powered by Mistral AI and here to help you improve your environmental impact based on your specific responses. I can provide personalized tips for:
• Reducing your carbon footprint
• Making better food choices
• Sustainable fashion decisions
• Energy and water conservation
• Waste reduction strategies

What area would you like to focus on first?`;
    }

    return "Hi! I'm EcoBee, your AI-powered sustainability assistant! 🌱 I'm powered by Mistral AI and can help you with eco-friendly tips, product recommendations, and answer questions about sustainable living. How can I help you today?";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: generatePersonalizedWelcome(),
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      // Create personalized context based on quiz results
      let context = "sustainability";
      if (scoringResult && quizResponses) {
        const score = Math.round(scoringResult.composite);
        const grade = scoringResult.grade;
        const recommendations = scoringResult.recommendations || [];
        const boundaryScores = scoringResult.per_boundary_averages;

        // Find the lowest-scoring boundary for targeted advice
        const lowestBoundary = Object.entries(boundaryScores).reduce((a, b) =>
          boundaryScores[a[0]] > boundaryScores[b[0]] ? b : a
        );

        context = `sustainability - User Profile: Score ${score}/100 (Grade: ${grade}), 
        Lowest scoring area: ${lowestBoundary[0]} (${Math.round(
          100 - (lowestBoundary[1] as number)
        )}/100), 
        Top recommendation: ${recommendations[0]?.action || "Not available"},
        Quiz responses: ${JSON.stringify(
          quizResponses.map((r) => ({
            question: r.question_text,
            answer: r.answer,
          }))
        )}`;
      }

      // Call backend Mistral API
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text.trim(),
          context: context,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text:
          result.response ||
          "I'm sorry, I couldn't generate a response right now.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling chat API:", error);

      // Fallback to local response if API fails
      const fallbackResponse = generateFallbackResponse(text.trim());
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateFallbackResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Personalized responses based on quiz data
    if (scoringResult && quizResponses) {
      const recommendations = scoringResult.recommendations || [];
      const boundaryScores = scoringResult.per_boundary_averages;

      // Find the lowest-scoring boundary for targeted advice
      const lowestBoundary = Object.entries(boundaryScores).reduce((a, b) =>
        boundaryScores[a[0]] > boundaryScores[b[0]] ? b : a
      );

      if (
        input.includes("improve") ||
        input.includes("better") ||
        input.includes("help")
      ) {
        const topRecommendation = recommendations[0];
        if (topRecommendation) {
          return `Based on your quiz results, here's your top priority: **${
            topRecommendation.action
          }** 🎯

This could improve your ${
            topRecommendation.boundary
          } impact significantly! Your current score in this area is ${Math.round(
            topRecommendation.current_score
          )}/100.

Would you like specific steps to implement this change, or shall we focus on a different area?`;
        }
      }

      if (
        input.includes("food") ||
        input.includes("eat") ||
        input.includes("diet")
      ) {
        const foodResponse = quizResponses.find((r) =>
          r.question_text?.toLowerCase().includes("food")
        );
        let personalizedTip = "Sustainable eating makes a big difference! 🥗 ";

        if (foodResponse) {
          if (foodResponse.answer?.includes("meat")) {
            personalizedTip +=
              "Since you mentioned eating meat regularly, consider trying 'Meatless Mondays' or replacing one meat meal per week with a plant-based alternative. This alone can reduce your carbon footprint by 10-15%!";
          } else if (foodResponse.answer?.includes("vegetarian")) {
            personalizedTip +=
              "Great that you're already vegetarian! To take it further, focus on local and organic produce, and consider reducing dairy consumption for even greater impact.";
          } else {
            personalizedTip +=
              "Consider eating more plant-based meals, choosing local and seasonal produce, reducing food waste by planning meals, and supporting regenerative agriculture.";
          }
        }

        return personalizedTip;
      }

      if (
        input.includes("transport") ||
        input.includes("travel") ||
        input.includes("car")
      ) {
        const transportResponse = quizResponses.find((r) =>
          r.question_text?.toLowerCase().includes("transport")
        );
        let personalizedTip = "Sustainable transport helps the planet! 🚌 ";

        if (transportResponse) {
          if (
            transportResponse.answer?.includes("car") ||
            transportResponse.answer?.includes("drive")
          ) {
            personalizedTip +=
              "Since you drive regularly, consider carpooling, using public transport for longer trips, or exploring hybrid/electric options for your next vehicle. Even small changes like combining errands into one trip can help!";
          } else if (
            transportResponse.answer?.includes("public") ||
            transportResponse.answer?.includes("bus")
          ) {
            personalizedTip +=
              "Excellent that you use public transport! You're already making a great impact. Consider cycling or walking for shorter trips when possible.";
          }
        }

        return personalizedTip;
      }

      if (
        input.includes("energy") ||
        input.includes("power") ||
        input.includes("electricity")
      ) {
        const energyScore = boundaryScores.climate || 0;
        let personalizedTip = "Energy efficiency is key! ⚡ ";

        if (energyScore > 70) {
          personalizedTip +=
            "Your energy usage seems high. Focus on: switching to LED bulbs, unplugging devices when not in use, using a programmable thermostat, and considering renewable energy options.";
        } else {
          personalizedTip +=
            "You're doing well with energy! To improve further, try: smart power strips, energy-efficient appliances, and consider solar panels if possible.";
        }

        return personalizedTip;
      }

      if (
        input.includes("waste") ||
        input.includes("recycle") ||
        input.includes("plastic")
      ) {
        const wasteScore = boundaryScores.biogeochemical || 0;
        let personalizedTip = "Reducing waste is crucial! ♻️ ";

        if (wasteScore > 70) {
          personalizedTip +=
            "Based on your results, focus on: using reusable bags and water bottles, choosing products with minimal packaging, composting organic waste, and properly sorting recyclables.";
        } else {
          personalizedTip +=
            "You're managing waste well! To do even better, try: buying in bulk to reduce packaging, choosing glass over plastic, and exploring zero-waste stores in your area.";
        }

        return personalizedTip;
      }

      if (input.includes("clothing") || input.includes("fashion")) {
        let personalizedTip = "Fashion can be sustainable too! 👕 ";
        personalizedTip +=
          "Look for: quality pieces that last longer, second-hand or vintage items, brands using organic or recycled materials, and clothes made locally to reduce transport emissions. Consider doing a closet audit to maximize what you already own!";
        return personalizedTip;
      }

      if (input.includes("score") || input.includes("result")) {
        const score = Math.round(scoringResult.composite);
        const grade = scoringResult.grade;
        return `Your sustainability score is ${score}/100 (Grade: ${grade}). 📊

Your strongest area: ${
          Object.entries(boundaryScores).reduce((a, b) =>
            boundaryScores[a[0]] < boundaryScores[b[0]] ? a : b
          )[0]
        }
Area for improvement: ${lowestBoundary[0]}

Would you like specific tips to improve your ${lowestBoundary[0]} score?`;
      }
    }

    // Default responses for general questions
    if (input.includes("sustainable") || input.includes("eco")) {
      return "Great question about sustainability! 🌍 Here are some key tips: Choose products with minimal packaging, buy local when possible, and look for certifications like Fair Trade or organic labels. Would you like specific advice for any category?";
    }

    if (input.includes("help") || input.includes("tips")) {
      return "I'm here to help with all your sustainability questions! 🌱 I can provide advice on: eco-friendly products, sustainable living tips, reducing your carbon footprint, and making environmentally conscious choices. What specific area interests you?";
    }

    // Default responses
    const defaultResponses = [
      "That's an interesting question! 🤔 I'm here to help with sustainability topics. Based on your quiz results, I can provide personalized advice for your specific situation. What would you like to focus on?",
      "I love helping with sustainability questions! 🌿 Since I have your quiz results, I can give you targeted advice for your lifestyle. What area interests you most - food, transport, energy, or waste reduction?",
      "Thanks for chatting with me! 🐝 I'm specialized in giving you personalized sustainability advice based on your quiz responses. What specific green changes would you like to explore?",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass w-[95vw] max-w-7xl max-h-[95vh] flex flex-col shadow-2xl border border-white/10">
        {/* Header */}
        <div className="glass-header text-white p-8 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="icon-badge text-3xl bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg animate-pulse">
                <span className="text-white text-2xl">🐝</span>
              </div>
              <div>
                <h2 className="neon-title text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                  🐝 EcoBee Assistant
                </h2>
                <p className="text-white/80 text-lg mt-1">✨ Your Buzzing AI Sustainability Expert</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-red-500/20"
              >
                <FaTimes className="text-white/70 hover:text-red-400 text-xl" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-transparent to-purple-900/5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] ${
                  message.isUser
                    ? "glass-card-inner bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30 shadow-lg"
                    : "glass-card-inner bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-400/30 shadow-lg"
                } p-6 rounded-3xl relative overflow-hidden`}
              >
                {/* Bee decoration for AI messages */}
                {!message.isUser && (
                  <div className="absolute -top-2 -right-2 text-xl opacity-60 animate-bounce">
                    🐝
                  </div>
                )}
                <div className="text-white whitespace-pre-line leading-relaxed text-lg relative z-10">
                  {message.text}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass-card-inner bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-400/30 p-6 rounded-3xl shadow-lg relative">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                {/* Bee decoration for typing */}
                <div className="absolute -top-2 -right-2 text-xl opacity-60 animate-bounce">
                  🐝
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-8 border-t border-white/10 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about sustainability..."
                className="w-full glass-input rounded-2xl px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-lg font-medium min-h-[60px] bg-gradient-to-r from-white/15 to-white/8 border border-white/25 focus:border-yellow-400/60 focus:bg-white/20 transition-all duration-300 shadow-lg"
              />
            </div>
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
              className="send-button px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xl flex-shrink-0 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 shadow-lg hover:shadow-xl border border-yellow-300/30"
              title="Send message"
            >
              <FaPaperPlane className="text-white" />
            </button>
          </div>
          {/* Elegant tip below input */}
          <div className="text-center mt-6 text-white/40 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
              💡 <span className="text-yellow-400 font-medium">Pro tip:</span> Ask about food, transport, or energy for personalized advice
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
