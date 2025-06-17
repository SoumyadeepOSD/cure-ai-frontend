/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Create axios instance with base configuration
export const lungCancerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
lungCancerApi.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
lungCancerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface ChatMessage {
  message: string;
  context?: Record<string, any>;
}

export interface RiskAnalysisRequest {
  age: number;
  gender: string;
  smoking_history: boolean;
  family_history: boolean;
  symptoms: string;
  cancer_type?: string;
}

export interface ReportRequest {
  patient_info: Record<string, any>;
  cancer_result: Record<string, any>;
  risk_analysis?: Record<string, any>;
}

export const apiService = {
  // Predict cancer from image
  predictImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await lungCancerApi.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Analyze image with detailed information
  analyzeImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await lungCancerApi.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Chat with AI doctor
  chatWithDoctor: async (message: ChatMessage) => {
    const response = await lungCancerApi.post('/chat', message);
    return response.data;
  },

  // Analyze risk factors
  analyzeRisk: async (riskData: RiskAnalysisRequest) => {
    const response = await lungCancerApi.post('/analyze-risk', riskData);
    return response.data;
  },

  // Generate PDF report
  generateReport: async (reportData: ReportRequest) => {
    const response = await lungCancerApi.post('/generate-report', reportData, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Educational chat
  educationalChat: async (message: ChatMessage) => {
    const response = await lungCancerApi.post('/educational-chat', message);
    return response.data;
  },
}; 