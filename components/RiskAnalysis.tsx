/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { useLungCancer } from '@/lib/hooks/useLungCancer';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import ReactMarkdown from 'react-markdown';

export const RiskAnalysis: React.FC = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    smoking_history: false,
    family_history: false,
    symptoms: '',
    cancer_type: '',
  });

  const { loading, error, riskAnalysis, analyzeRisk, prediction, analysis } = useLungCancer();

  // Update cancer_type when prediction changes
  useEffect(() => {
    if (prediction?.prediction) {
      setFormData(prev => ({
        ...prev,
        cancer_type: prediction.prediction
      }));
    }
  }, [prediction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await analyzeRisk({
        age: parseInt(formData.age),
        gender: formData.gender,
        smoking_history: formData.smoking_history,
        family_history: formData.family_history,
        symptoms: formData.symptoms,
        cancer_type: formData.cancer_type || undefined,
      });
    } catch (err) {
      console.error('Error in risk analysis:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-900/50 to-black/50 border-blue-500/20">
        <h2 className="text-2xl font-semibold mb-6 text-blue-100">Risk Analysis</h2>
        
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="smoking_history"
                checked={formData.smoking_history}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-black/50 border-blue-500/20 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-blue-200">
                History of smoking
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="family_history"
                checked={formData.family_history}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-black/50 border-blue-500/20 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-blue-200">
                Family history of lung cancer
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Current Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe any symptoms you're experiencing..."
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Risk...
              </div>
            ) : (
              'Analyze Risk'
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4 bg-red-900/50 border-red-500/20">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {riskAnalysis && (
          <div className="mt-6 p-4 bg-black/30 rounded-lg border border-blue-500/20">
            <h3 className="text-lg font-semibold mb-4 text-blue-200">Risk Analysis Results</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-blue-200 mb-2">Risk Factors</h4>
                <ul className="list-disc list-inside text-gray-100 prose prose-invert max-w-none">
                  {riskAnalysis.risk_factors.map((factor: string, index: number) => (
                    <li key={index}><ReactMarkdown>{factor}</ReactMarkdown></li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-blue-200 mb-2">Risk Score</h4>
                <p className="text-gray-100 prose prose-invert max-w-none"><ReactMarkdown>{`${riskAnalysis.risk_score}%`}</ReactMarkdown></p>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-blue-200 mb-2">Recommendations</h4>
                <ul className="list-disc list-inside text-gray-100 prose prose-invert max-w-none">
                  {riskAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index}><ReactMarkdown>{rec}</ReactMarkdown></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}; 