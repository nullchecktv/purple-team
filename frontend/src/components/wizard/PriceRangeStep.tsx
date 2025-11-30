'use client';

import { useState } from 'react';

interface PriceRangeStepProps {
  onNext: (data: { min: number; max: number }) => void;
  onBack: () => void;
  initialValue?: { min: number; max: number };
}

export default function PriceRangeStep({ onNext, onBack, initialValue }: PriceRangeStepProps) {
  const [minPrice, setMinPrice] = useState(initialValue?.min || 20);
  const [maxPrice, setMaxPrice] = useState(initialValue?.max || 500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ min: minPrice, max: maxPrice });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 animate-fade-in">
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 p-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">What's your budget?</h2>
          <p className="text-lg text-gray-500">Set your price range for the perfect tree</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">${minPrice}</span>
              <span className="text-gray-400 text-sm">to</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">${maxPrice}</span>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-600 mb-3">
                  Minimum: ${minPrice}
                </label>
                <input
                  type="range"
                  id="minPrice"
                  min="20"
                  max="500"
                  step="5"
                  value={minPrice}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val < maxPrice) {
                      setMinPrice(val);
                    }
                  }}
                  className="w-full h-3 bg-gradient-to-r from-green-200 to-red-200 rounded-full appearance-none cursor-pointer accent-green-600"
                />
              </div>

              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-600 mb-3">
                  Maximum: ${maxPrice}
                </label>
                <input
                  type="range"
                  id="maxPrice"
                  min="20"
                  max="500"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > minPrice) {
                      setMaxPrice(val);
                    }
                  }}
                  className="w-full h-3 bg-gradient-to-r from-green-200 to-red-200 rounded-full appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-green-50 to-red-50 rounded-2xl p-5 border border-green-200/50">
              <p className="text-sm text-gray-600">
                ✨ Most trees range from $50-$200. Artificial trees last for years.
              </p>
            </div>
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
