'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function Home() {
  const [showImageUpload, setShowImageUpload] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-4xl mx-auto px-6">
          <div className="text-8xl mb-8">🐣</div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Chicken Hatching Management System
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Enterprise-grade AI-powered blockchain solution for chicken egg management
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a 
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Launch Dashboard
            </a>
            <button
              onClick={() => setShowImageUpload(!showImageUpload)}
              className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              📸 Upload Egg Image
            </button>
          </div>

          {showImageUpload && (
            <div className="mt-12 p-8 bg-white rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                🥚 AI-Powered Egg Analysis
              </h2>
              <p className="text-slate-600 mb-6">
                Upload an image of your egg for comprehensive AI analysis using AWS Bedrock
              </p>
              <ImageUpload />
              <button
                onClick={() => setShowImageUpload(false)}
                className="mt-6 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                ✕ Close Upload
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}