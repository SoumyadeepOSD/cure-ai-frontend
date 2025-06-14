"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLungCancer } from '@/lib/hooks/useLungCancer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import ReactMarkdown from 'react-markdown';

export const EducationalChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { loading, error, educationalResponse, chatWithEducational } = useLungCancer();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setMessage(''); // Clear input immediately

    try {
      // Send message to educational chat
      const response = await chatWithEducational({ 
        message,
        context: { educational: true }
      });
      
      // Add AI response to chat history
      if (response?.response) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
      }
    } catch (err) {
      console.error('Error in educational chat:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card className="p-6 bg-gradient-to-br from-blue-900/50 to-black/50 border-blue-500/20">
        <div className="h-[400px] overflow-y-auto mb-4 space-y-4">
          {chatHistory.map((msg, index) => (
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
          ))}
          {loading && (
            <div className="text-center text-blue-400">
              <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
              AI is thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-500/20">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about lung cancer, prevention, or treatment..."
            className="flex-1 px-4 py-2 rounded-md border border-blue-500/20 bg-blue-900/20 text-gray-100 placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </Card>
    </div>
  );
}; 