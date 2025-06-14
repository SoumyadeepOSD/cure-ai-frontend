/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useLungCancer } from '@/lib/hooks/useLungCancer';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface ImageUploadProps {
  onAnalysisUpdate: (analysis: any) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onAnalysisUpdate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);
  const { loading, error, prediction, analysis, storedImage, handleImageAnalysis, clearAnalysisData } = useLungCancer();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    try {
      const results = await handleImageAnalysis(selectedFile);
      // Store results in localStorage
      localStorage.setItem('lungCancerAnalysis', JSON.stringify(results));
      onAnalysisUpdate(results);
    } catch (err) {
      console.error('Error processing image:', err);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    clearAnalysisData();
    localStorage.removeItem('lungCancerAnalysis');
    onAnalysisUpdate(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500/20 hover:border-blue-500/40'}`}
      >
        <input {...getInputProps()} />
        {storedImage && mounted ? (
          <div className="space-y-4">
            <img
              src={storedImage}
              alt="Uploaded scan"
              className="max-h-[300px] mx-auto rounded-lg"
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              variant="destructive"
              className="mt-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Image
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-blue-200">
              {isDragActive
                ? "Drop the image here..."
                : "Drag 'n' drop an image here, or click to select"}
            </p>
            <p className="text-sm text-blue-400">
              Supported formats: JPEG, JPG, PNG (max 5MB)
            </p>
          </div>
        )}
      </div>

      {selectedFile && !storedImage && (
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </div>
          ) : (
            'Analyze Image'
          )}
        </Button>
      )}

      {error && (
        <Alert variant="destructive" className="bg-red-900/50 border-red-500/20">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 