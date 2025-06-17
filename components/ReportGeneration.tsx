/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useLungCancer } from '@/lib/hooks/useLungCancer';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import ReactMarkdown from 'react-markdown';

interface ReportRequest {
  patient_info: {
    name: string;
    age: string;
    gender: string;
    medical_history: string;
    symptoms: string;
    current_medications: string;
  };
  cancer_result: {
    diagnosis: string;
    stage?: string;
    treatment_plan?: string;
    prognosis?: string;
  };
  risk_analysis: {
    risk_factors: string[];
    risk_score: number;
    recommendations: string[];
  };
  analysis_type: 'comprehensive' | 'quick' | 'detailed';
  include_images: boolean;
}

export const ReportGeneration: React.FC = () => {
  const [formData, setFormData] = useState<ReportRequest>({
    patient_info: {
      name: '',
      age: '',
      gender: '',
      medical_history: '',
      symptoms: '',
      current_medications: '',
    },
    cancer_result: {
      diagnosis: '',
    },
    risk_analysis: {
      risk_factors: [],
      risk_score: 0,
      recommendations: [],
    },
    analysis_type: 'comprehensive',
    include_images: true,
  });

  const { loading, error, report, generateReport, prediction, analysis, riskAnalysis, analyzeRisk } = useLungCancer();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update cancer_result when prediction changes
  useEffect(() => {
    if (prediction) {
      setFormData(prev => ({
        ...prev,
        cancer_result: {
          ...prev.cancer_result,
          diagnosis: prediction.prediction,
          stage: prediction.cancer_class,
          prognosis: `Confidence: ${(prediction.confidence * 100).toFixed(2)}%`,
          treatment_plan: analysis?.report || ''
        }
      }));
    }
  }, [prediction, analysis]);

  // Update risk_analysis when riskAnalysis changes
  useEffect(() => {
    if (riskAnalysis) {
      console.log('riskAnalysis from hook:', riskAnalysis); // Debug log
      setFormData(prev => ({
        ...prev,
        risk_analysis: {
          ...prev.risk_analysis,
          risk_factors: riskAnalysis.risk_factors || [],
          risk_score: riskAnalysis.risk_score || 0,
          recommendations: riskAnalysis.recommendations || []
        }
      }));
    }
  }, [riskAnalysis]);

  // Format date consistently
  const formatDate = (dateString: string) => {
    if (!mounted) return dateString; // Return raw string during SSR
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e:any) {
      return dateString;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Include the stored analysis data in the report request
      const reportData = {
        ...formData,
        cancer_result: {
          ...formData.cancer_result,
          diagnosis: prediction?.prediction || formData.cancer_result.diagnosis,
          stage: prediction?.cancer_class || formData.cancer_result.stage,
          prognosis: prediction ? `Confidence: ${(prediction.confidence * 100).toFixed(2)}%` : formData.cancer_result.prognosis,
          treatment_plan: analysis?.report || formData.cancer_result.treatment_plan,
          analysis_details: analysis?.details || {},
          prediction_text: prediction?.prediction || '',
          confidence: prediction?.confidence ? `${(prediction.confidence * 100).toFixed(2)}%` : 'N/A'
        },
        risk_analysis: {
          risk_factors: riskAnalysis?.risk_factors || ['Not assessed'],
          risk_score: riskAnalysis?.risk_score || 0,
          recommendations: riskAnalysis?.recommendations || ['Complete risk assessment required'],
          risk_level: riskAnalysis?.risk_level || 'Not assessed'
        }
      };
      console.log('Report data sent to backend:', reportData); // Debug log
      await generateReport(reportData);
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => {
        const sectionData = prev[section as keyof ReportRequest] as Record<string, any>;
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-900/50 to-black/50 border-blue-500/20">
        <h2 className="text-2xl font-semibold mb-6 text-blue-100">Generate Medical Report</h2>

        {prediction && (
          <div className="mb-6 p-4 bg-black/30 rounded-lg border border-blue-500/20">
            <h3 className="text-lg font-semibold mb-2 text-blue-200">Image Analysis Results</h3>
            <div className="space-y-2 text-gray-100">
              <p>
                <span className="font-medium">Cancer Class:</span> {prediction.prediction}
              </p>
              <p>
                <span className="font-medium">Confidence:</span> {(prediction.confidence * 100).toFixed(2)}%
              </p>
            </div>
            {analysis?.report && (
              <div className="mt-4 pt-4 border-t border-blue-500/20">
                <h4 className="text-md font-medium text-blue-200 mb-2">Analysis Report</h4>
                <div className="prose prose-invert max-w-none text-gray-100">
                  <ReactMarkdown>
                    {analysis.report}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-200">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="patient_info.name"
                  value={formData.patient_info.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Age
                </label>
                <input
                  type="text"
                  name="patient_info.age"
                  value={formData.patient_info.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Gender
              </label>
              <select
                name="patient_info.gender"
                value={formData.patient_info.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Medical History
              </label>
              <textarea
                name="patient_info.medical_history"
                value={formData.patient_info.medical_history}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter medical history..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Current Symptoms
              </label>
              <textarea
                name="patient_info.symptoms"
                value={formData.patient_info.symptoms}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe current symptoms..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Current Medications
              </label>
              <textarea
                name="patient_info.current_medications"
                value={formData.patient_info.current_medications}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="List current medications..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-200">Report Options</h3>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Analysis Type
              </label>
              <select
                name="analysis_type"
                value={formData.analysis_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/50 border border-blue-500/20 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="quick">Quick</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="include_images"
                checked={formData.include_images}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-black/50 border-blue-500/20 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-blue-200">
                Include images in report
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Report...
              </div>
            ) : (
              'Generate Report'
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4 bg-red-900/50 border-red-500/20">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {report && (
          <div className="mt-6 p-4 bg-black/30 rounded-lg border border-blue-500/20">
            <h3 className="text-lg font-semibold mb-2 text-blue-100">Generated Report</h3>
            <div className="space-y-4">
              <div className="text-blue-200">
                <p><span className="font-medium">Report ID:</span> {report.report_id}</p>
                <p><span className="font-medium">Generated At:</span> {formatDate(report.generated_at)}</p>
              </div>
              
              <div className="text-blue-200">
                <h4 className="font-medium mb-2">Summary</h4>
                <div className="prose prose-invert max-w-none text-blue-200">
                  <ReactMarkdown>{report.summary.status}</ReactMarkdown>
                </div>
                <ul className="list-disc list-inside mt-2 prose prose-invert max-w-none text-blue-200">
                  {report.summary.key_findings.map((finding, index) => (
                    <li key={index}>
                      <ReactMarkdown>{finding}</ReactMarkdown>
                    </li>
                  ))}
                </ul>
              </div>
              {Object.entries(report.sections).map(([key, section]) => (
                <div key={key} className="text-blue-200">
                  <h4 className="font-medium mb-2">{section.title}</h4>
                  <div className="space-y-2 prose prose-invert max-w-none text-blue-200">
                    {Object.entries(section.data).map(([field, value]) => {
                      // Fields to exclude from general rendering and handle specifically or omit
                      const excludedFields = ['analysis_details', 'prediction_text', 'confidence', 'treatment_plan', 'risk_factors', 'risk_score', 'recommendations', 'risk_level', 'cancer_class'];
                      if (excludedFields.includes(field)) {
                        return null;
                      }
                      // Handle arrays for risk_factors and recommendations separately if they are not excluded.
                      if (Array.isArray(value)) {
                        return (
                          <div key={field}>
                            <span className="font-medium">{field}:</span>
                            <ul className="list-disc list-inside mt-1">
                              {value.map((item, itemIndex) => (
                                <li key={itemIndex}><ReactMarkdown>{String(item)}</ReactMarkdown></li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      return (
                        <p key={field}>
                          <span className="font-medium">{field}:</span> <ReactMarkdown>{String(value)}</ReactMarkdown>
                        </p>
                      );
                    })}
                  </div>
                  {Object.keys(section.additional_info).length > 0 && (
                    <div className="mt-2">
                      <h5 className="font-medium mb-1">Additional Information</h5>
                      <div className="space-y-1 prose prose-invert max-w-none text-blue-200">
                        {Object.entries(section.additional_info).map(([field, value]) => (
                          <p key={field}>
                            <span className="font-medium">{field}:</span> <ReactMarkdown>{String(value)}</ReactMarkdown>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Separate rendering for Treatment Plan */}
              {report.sections.cancer_detection?.data.treatment_plan && (
                <div className="mt-4 pt-4 border-t border-blue-500/20">
                  <h4 className="font-medium mb-2 text-blue-200">Treatment Plan</h4>
                  <div className="prose prose-invert max-w-none text-sm text-blue-100">
                    <ReactMarkdown>
                      {report.sections.cancer_detection.data.treatment_plan}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}; 