'use client';

import { useState } from 'react';

interface ReturnPolicyStepProps {
  onNext: (minReturnDays: number) => void;
  onBack: () => void;
  initialValue?: number;
}

export default function ReturnPolicyStep({ onNext, onBack, initialValue }: ReturnPolicyStepProps) {
  const [selectedDays, setSelectedDays] = useState(initialValue || 14);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(selectedDays);
  };

  const options = [
    { days: 7, icon: '📅', title: '7 Days', description: 'Basic return window' },
    { days: 14, icon: '📆', title: '14 Days', description: 'Standard return window' },
    { days: 30, icon: '🗓️', title: '30 Days', description: 'Extended return window' },
    { days: 0, icon: '✨', title: 'No Preference', description: 'Show all options' }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Return policy?</h2>
        <p className="text-gray-600 mb-8">Choose your minimum acceptable return window</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => setSelectedDays(option.days)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  selectedDays === option.days
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <span className="text-4xl mb-2 block">{option.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                  {selectedDays === option.days && (
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
              💡 Longer return windows give you peace of mind if the tree doesn't meet your expectations.
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
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
