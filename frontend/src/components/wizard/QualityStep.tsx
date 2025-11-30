'use client';

import { useState } from 'react';

interface QualityStepProps {
  onNext: (minQuality: number) => void;
  onBack: () => void;
  initialValue?: number;
}

export default function QualityStep({ onNext, onBack, initialValue }: QualityStepProps) {
  const [selectedQuality, setSelectedQuality] = useState(initialValue || 3);
  const [hoveredQuality, setHoveredQuality] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(selectedQuality);
  };

  const displayQuality = hoveredQuality || selectedQuality;

  const qualityDescriptions = [
    '',
    'Basic - Budget-friendly options',
    'Fair - Good value for money',
    'Good - Solid quality',
    'Very Good - High quality',
    'Excellent - Premium quality'
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 animate-fade-in">
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 p-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">Quality matters?</h2>
          <p className="text-lg text-gray-500">Select minimum quality rating you're looking for</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-center">
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedQuality(star)}
                  onMouseEnter={() => setHoveredQuality(star)}
                  onMouseLeave={() => setHoveredQuality(0)}
                  className="transition-all duration-300 hover:scale-125 active:scale-110"
                >
                  <svg
                    className={`w-20 h-20 ${
                      star <= displayQuality
                        ? 'text-yellow-400 fill-current drop-shadow-lg'
                        : 'text-gray-300'
                    } transition-all duration-300`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
            </div>

            <p className="text-2xl font-bold text-gray-900 mb-2">
              {displayQuality} {displayQuality === 1 ? 'Star' : 'Stars'} & Up
            </p>
            <p className="text-gray-500">{qualityDescriptions[displayQuality]}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-red-50 rounded-2xl p-5 border border-green-200/50">
            <p className="text-sm text-gray-600">
              ✨ Higher ratings mean better needle retention, fuller branches, and overall tree quality.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-semibold hover:bg-gray-200 hover:scale-[1.02] transition-all duration-300"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-red-600 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              Continue →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
