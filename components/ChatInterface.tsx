"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLungCancer } from '@/lib/hooks/useLungCancer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import ReactMarkdown from 'react-markdown';

export const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { loading, error, chatResponse, chatWithDoctor, prediction, analysis } = useLungCancer();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const storedChat = localStorage.getItem('doctorChatHistory');
    if (storedChat) {
      setChatHistory(JSON.parse(storedChat));
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('doctorChatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat history
    const userMessage = { role: 'user' as const, content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage(''); // Clear input immediately

    try {
      // Get stored analysis data
      const storedAnalysis = localStorage.getItem('lungCancerAnalysis');
      const analysisData = storedAnalysis ? JSON.parse(storedAnalysis) : null;

      // Create context with analysis data
      const context = {
        prediction: analysisData?.prediction?.prediction,
        confidence: analysisData?.prediction?.confidence,
        cancer_class: analysisData?.prediction?.cancer_class,
        analysis: analysisData?.analysis,
        chatHistory: chatHistory
      };

      const response = await chatWithDoctor({
        message,
        context
      });

      // Add AI response to chat history
      if (response?.response) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
      }
    } catch (err) {
      console.error('Error in chat:', err);
      // Add error message to chat
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    localStorage.removeItem('doctorChatHistory');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-900/50 to-black/50 border-blue-500/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-blue-100">Chat with AI Doctor</h2>
          {chatHistory.length > 0 && (
            <Button
              onClick={clearChat}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Chat
            </Button>
          )}
        </div>

        {prediction && (
          <div className="mb-6 p-4 bg-black/30 rounded-lg border border-blue-500/20">
            <h3 className="text-lg font-semibold mb-2 text-blue-200">Image Analysis Results</h3>
            <div className="space-y-2 text-gray-100">
              <p>
                <span className="font-medium">Cancer Class:</span> {prediction.cancer_class}
              </p>
              <p>
                <span className="font-medium">Prediction:</span> {prediction.prediction}
              </p>
              <p>
                <span className="font-medium">Confidence:</span> {(prediction.confidence * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="h-[400px] overflow-y-auto p-4 bg-black/30 rounded-lg border border-blue-500/20">
            {chatHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Start a conversation with the AI doctor...</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-black/30 text-gray-100 border border-blue-500/20'
                    }`}
                  >
                    <div className="prose prose-invert max-w-none text-sm text-gray-100">
                      <ReactMarkdown>
                        {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="text-center text-blue-400">
                <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                AI is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your condition..."
              className="flex-1 px-4 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                'Send'
              )}
            </Button>
          </form>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4 bg-red-900/50 border-red-500/20">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}; 