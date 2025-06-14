"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { ReportGeneration } from "@/components/ReportGeneration";
import { EducationalChat } from "@/components/EducationalChat";
import ReactMarkdown from 'react-markdown';
import { useLungCancer } from '@/lib/hooks/useLungCancer';
import { useEffect, useState } from 'react';

export default function Home() {
  const { loading, prediction, analysis } = useLungCancer();
  const [storedAnalysis, setStoredAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Load analysis from localStorage on component mount
    const stored = localStorage.getItem('lungCancerAnalysis');
    if (stored) {
      setStoredAnalysis(JSON.parse(stored));
    }
  }, [analysis]); // Re-run when analysis changes

  const handleAnalysisUpdate = (newAnalysis: any) => {
    setIsAnalyzing(true);
    setStoredAnalysis(newAnalysis);
    // Reset analyzing state after a short delay to ensure smooth transition
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <Tabs orientation="vertical" defaultValue="image" className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-black/50 border-r border-blue-800/20 p-4">
          <TabsList className="flex flex-col h-auto bg-transparent border border-blue-800/20 rounded-lg p-2 space-y-2">
            <TabsTrigger 
              value="image" 
              className="w-full justify-start px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              Image Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="w-full justify-start px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              AI Doctor Chat
            </TabsTrigger>
            <TabsTrigger 
              value="risk" 
              className="w-full justify-start px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              className="w-full justify-start px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              Generate Report
            </TabsTrigger>
            <TabsTrigger 
              value="educational" 
              className="w-full justify-start px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
            >
              Educational Chat
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <TabsContent value="image" className="mt-0">
            <div className="flex gap-6 h-full">
              {/* Left section - Image Upload */}
              <div className="w-1/2">
                <ImageUpload onAnalysisUpdate={handleAnalysisUpdate} />
              </div>
              {/* Right section - Analysis Results */}
              <div className="w-1/2 h-[85vh] overflow-y-scroll">
                <Card className="h-full bg-gradient-to-br from-blue-900/50 to-black/50 border-blue-800/20 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-100">Image Analysis</h3>
                  {loading || isAnalyzing ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="ml-2 text-blue-400">Analyzing image...</p>
                    </div>
                  ) : storedAnalysis ? (
                    <div className="prose prose-invert max-w-none text-blue-200">
                      <div className="space-y-4">
                        <div className="p-4 bg-black/30 rounded-lg border border-blue-500/20">
                          <h4 className="text-lg font-semibold mb-2 text-blue-200">Prediction Results</h4>
                          <div className="space-y-2 text-gray-100">
                            <p>
                              <span className="font-medium">Cancer Class:</span> {storedAnalysis.prediction?.cancer_class}
                            </p>
                            <p>
                              <span className="font-medium">Prediction:</span> {storedAnalysis.prediction?.prediction}
                            </p>
                            <p>
                              <span className="font-medium">Confidence:</span> {(storedAnalysis.prediction?.confidence * 100).toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        {storedAnalysis.analysis?.report && (
                          <div className="p-4 bg-black/30 rounded-lg border border-blue-500/20">
                            <h4 className="text-lg font-semibold mb-2 text-blue-200">Analysis Report</h4>
                            <div className="prose prose-invert max-w-none text-gray-100">
                              <ReactMarkdown>
                                {storedAnalysis.analysis.report}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">Image analysis results will appear here...</p>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="risk" className="mt-0">
            <RiskAnalysis />
          </TabsContent>

          <TabsContent value="report" className="mt-0">
            <ReportGeneration />
          </TabsContent>

          <TabsContent value="educational" className="mt-0">
            <EducationalChat />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
