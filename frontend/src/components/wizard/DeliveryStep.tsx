'use client';

import { useState } from 'react';

interface DeliveryStepProps {
  onNext: (data: { required: boolean; preferred: boolean }) => void;
  onBack: () => void;
  initialValue?: { required: boolean; preferred: boolean };
}

export default function DeliveryStep({ onNext, onBack, initialValue }: DeliveryStepProps) {
  const [deliveryPreference, setDeliveryPreference] = useState<'required' | 'preferred' | 'not-needed'>(
    initialValue?.required ? 'required' : initialValue?.preferred ? 'preferred' : 'not-needed'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      required: deliveryPreference === 'required',
      preferred: deliveryPreference === 'preferred'
    });
  };

  const options = [
    {
      value: 'required' as const,
      icon: '🚚',
      title: 'Delivery Required',
      description: 'I need the tree delivered to my home'
    },
    {
      value: 'preferred' as const,
      icon: '📦',
      title: 'Delivery Preferred',
      description: 'I prefer delivery but can pick up if needed'
    },
    {
      value: 'not-needed' as const,
      icon: '🚗',
      title: 'Pickup OK',
      description: 'I can pick up the tree myself'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Delivery preference?</h2>
        <p className="text-gray-600 mb-8">How would you like to get your tree?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDeliveryPreference(option.value)}
                className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  deliveryPreference === option.value
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{option.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {option.title}
                    </h3>
                    <p className="text-gray-600">{option.description}</p>
                  </div>
                  {deliveryPreference === option.value && (
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
              💡 Delivery fees typically range from $10-$45 depending on tree size and distance.
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
