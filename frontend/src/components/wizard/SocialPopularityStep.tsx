'use client';

import { useState } from 'react';

interface SocialPopularityStepProps {
  onNext: (popularityLevel: 'high' | 'medium' | 'low' | 'any') => void;
  onBack: () => void;
  initialValue?: 'high' | 'medium' | 'low' | 'any';
}

export default function SocialPopularityStep({ onNext, onBack, initialValue }: SocialPopularityStepProps) {
  const [selectedLevel, setSelectedLevel] = useState<'high' | 'medium' | 'low' | 'any'>(initialValue || 'any');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(selectedLevel);
  };

  const options = [
    {
      value: 'high' as const,
      icon: '🔥',
      title: 'Trending',
      description: 'Most popular on social media',
      badge: '80+ popularity score'
    },
    {
      value: 'medium' as const,
      icon: '👍',
      title: 'Popular',
      description: 'Well-liked and shared',
      badge: '50-79 popularity score'
    },
    {
      value: 'low' as const,
      icon: '🌱',
      title: 'Under the Radar',
      description: 'Hidden gems',
      badge: 'Under 50 popularity score'
    },
    {
      value: 'any' as const,
      icon: '✨',
      title: 'No Preference',
      description: 'Show me everything',
      badge: 'All trees'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Social popularity?</h2>
        <p className="text-gray-600 mb-8">Do you want a tree that's trending on social media?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedLevel(option.value)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  selectedLevel === option.value
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <span className="text-4xl mb-2 block">{option.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-xs text-gray-700 rounded-full">
                    {option.badge}
                  </span>
                  {selectedLevel === option.value && (
                    <svg className="w-6 h-6 text-blue-600 mx-auto mt-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 Trending trees are popular on Instagram, TikTok, and Pinterest. They're great for sharing holiday photos!
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              See Results
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
