"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

const typewriterText = "Precision Health, AI-Driven.";
const typewriterSubText = "Transforming early detection with intelligent analytics.";

export default function LandingPage() {
  const [displayedText, setDisplayedText] = useState("");
  const [displayedSubText, setDisplayedSubText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < typewriterText.length) {
        setDisplayedText((prev) => prev + typewriterText.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        let j = 0;
        const subTypingInterval = setInterval(() => {
          if (j < typewriterSubText.length) {
            setDisplayedSubText((prev) => prev + typewriterSubText.charAt(j));
            j++;
          } else {
            clearInterval(subTypingInterval);
            setIsTypingComplete(true);
          }
        }, 30);

      }
    }, 50);

    return () => {
      clearInterval(typingInterval);
    };
  }, []);
  if(isClient)
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black overflow-hidden">
      <Header />
      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center py-24 md:py-32">
        <div className="text-center space-y-2 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white animate-fade-in" style={{ lineHeight: '1.0' }}>
            {displayedText}
            <span className="animate-blink">|</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 animate-fade-in-delay">
            {displayedSubText}
            {isTypingComplete && <span className="animate-blink">|</span>}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/home">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-base rounded-md transition-all duration-300 transform hover:scale-105">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-900/50 px-5 py-2 text-base rounded-md transition-all duration-300 transform hover:scale-105">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="text-blue-400 mt-4 text-sm animate-fade-in">Built for Cure-AI Intelligence.</p>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-20 hidden">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 bg-black/50 backdrop-filter backdrop-blur-lg border border-blue-500/20 rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-blue-200 mb-2">Advanced Image Analysis</h3>
            <p className="text-gray-100">
              State-of-the-art AI algorithms for precise analysis of lung scans and early detection of abnormalities.
            </p>
          </Card>
          <Card className="p-6 bg-black/50 backdrop-filter backdrop-blur-lg border border-blue-500/20 rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-blue-200 mb-2">Risk Assessment</h3>
            <p className="text-gray-100">
              Comprehensive risk analysis based on medical history, symptoms, and scan results.
            </p>
          </Card>
          <Card className="p-6 bg-black/50 backdrop-filter backdrop-blur-lg border border-blue-500/20 rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-blue-200 mb-2">Detailed Reports</h3>
            <p className="text-gray-100">
              Generate comprehensive medical reports with treatment recommendations and follow-up care plans.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 hidden">
        <Card className="p-12 bg-black/50 backdrop-filter backdrop-blur-lg border border-blue-500/20 text-center rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the power of AI-driven lung cancer detection and analysis. Get started with our comprehensive suite of tools today.
          </p>
          <Link href="/home">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg transition-all duration-300 transform hover:scale-105">
              Launch Application
            </Button>
          </Link>
        </Card>
      </div>
    </main>
  );
}
