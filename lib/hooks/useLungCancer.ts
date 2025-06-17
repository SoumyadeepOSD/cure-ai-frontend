/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { lungCancerApi } from '@/lib/api';


interface ChatMessage {
  message: string;
  context?: {
    concise?: boolean;
    educational?: boolean;
    prediction?: string;
    confidence?: number;
    cancer_class?: string;
    analysis?: any;
    chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
}

interface ReportRequest {
  patient_info: {
    name: string;
    age: string;
    gender: string;
    medical_history: string;
    symptoms: string;
    current_medications: string;
    additionalProp1?: Record<string, any>;
  };
  cancer_result: {
    diagnosis: string;
    stage?: string;
    treatment_plan?: string;
    prognosis?: string;
    additionalProp1?: Record<string, any>;
  };
  risk_analysis: {
    risk_factors: string[];
    risk_score: number;
    recommendations: string[];
    additionalProp1?: Record<string, any>;
  };
  analysis_type: 'comprehensive' | 'quick' | 'detailed';
  include_images: boolean;
  additional_notes?: string;
}

interface ReportResponse {
  report_id: string;
  generated_at: string;
  sections: {
    [key: string]: {
      title: string;
      data: Record<string, any>;
      additional_info: Record<string, any>;
    };
  };
  summary: {
    status: string;
    key_findings: string[];
  };
}

interface AnalysisData {
  imageUrl: string;
  prediction: {
    prediction: string;
    confidence: number;
    cancer_class: string;
  };
  analysis: {
    report: string;
    details: Record<string, any>;
  };
  timestamp: string;
}

export const useLungCancer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [educationalResponse, setEducationalResponse] = useState<string | null>(null);
  const [storedImage, setStoredImage] = useState<string | null>(null);

  // Load stored analysis data on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('lungCancerAnalysis');
    if (storedData) {
      const data: AnalysisData = JSON.parse(storedData);
      setPrediction(data.prediction);
      setAnalysis(data.analysis);
      setStoredImage(data.imageUrl);
    }
  }, []);

  // Store analysis data in localStorage
  const storeAnalysisData = (imageUrl: string, predictionData: any, analysisData: any) => {
    console.log('Storing Analysis Data:', {
      imageUrl,
      predictionData,
      analysisData
    });

    const data: AnalysisData = {
      imageUrl,
      prediction: {
        prediction: predictionData.prediction,
        confidence: predictionData.confidence,
        cancer_class: predictionData.cancer_class
      },
      analysis: {
        report: typeof analysisData.report === 'string' 
          ? analysisData.report 
          : JSON.stringify(analysisData.report, null, 2),
        details: analysisData.details || {}
      },
      timestamp: new Date().toISOString()
    };

    console.log('Final Stored Data:', data);
    localStorage.setItem('lungCancerAnalysis', JSON.stringify(data));
  };

  const predictImage = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await lungCancerApi.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Store the prediction data
      const predictionData = {
        prediction: response.data.prediction,
        confidence: response.data.confidence,
        cancer_class: response.data.cancer_class
      };
      setPrediction(predictionData);
      return predictionData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Error predicting image';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await lungCancerApi.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Analysis API Response:', response.data);
      
      // Ensure we always have a string for the report
      const analysisReport = typeof response.data === 'string' 
        ? response.data 
        : typeof response.data.analysis === 'string'
          ? response.data.analysis
          : typeof response.data.report === 'string'
            ? response.data.report
            : JSON.stringify(response.data, null, 2);
      
      const analysisData = {
        report: analysisReport,
        details: response.data.details || {}
      };
      
      console.log('Processed Analysis Data:', analysisData);
      setAnalysis(analysisData);
      return analysisData;
    } catch (err: any) {
      console.error('Analysis API Error:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Error analyzing image';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleImageAnalysis = async (file: File) => {
    try {
      // Create image URL for storage
      const imageUrl = URL.createObjectURL(file);
      setStoredImage(imageUrl);

      // Get prediction and analysis
      const [predictionResult, analysisResult] = await Promise.all([
        predictImage(file),
        analyzeImage(file)
      ]);

      console.log('Image Analysis Results:', {
        prediction: predictionResult,
        analysis: analysisResult
      });

      // Store the results with proper structure
      storeAnalysisData(imageUrl, predictionResult, analysisResult);

      return { prediction: predictionResult, analysis: analysisResult };
    } catch (err) {
      console.error('Error in image analysis:', err);
      throw err;
    }
  };

  const clearAnalysisData = () => {
    localStorage.removeItem('lungCancerAnalysis');
    setPrediction(null);
    setAnalysis(null);
    setStoredImage(null);
  };

  const chatWithDoctor = async (message: ChatMessage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await lungCancerApi.post('/chat', message);
      setChatResponse(response.data.response);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Error in chat';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeRisk = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await lungCancerApi.post('/analyze-risk', data);
      setRiskAnalysis(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Error in risk analysis';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (data: ReportRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await lungCancerApi.post('/generate-report', data);
      setReport(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Error generating report';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const chatWithEducational = async (message: ChatMessage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await lungCancerApi.post('/educational-chat', message);
      setEducationalResponse(response.data.response);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Error in educational chat';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    prediction,
    analysis,
    chatResponse,
    riskAnalysis,
    report,
    educationalResponse,
    storedImage,
    predictImage,
    analyzeImage,
    handleImageAnalysis,
    clearAnalysisData,
    chatWithDoctor,
    analyzeRisk,
    generateReport,
    chatWithEducational,
  };
}; 