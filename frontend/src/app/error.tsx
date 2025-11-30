'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="text-6xl mb-6">🐣💥</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Something went wrong with our chickens!
        </h2>
        <p className="text-slate-600 mb-6">
          Our AI-powered chicken management system encountered an error. 
          Don't worry, no actual chickens were harmed.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          Try again
        </button>
      </div>
    </div>
  );
}