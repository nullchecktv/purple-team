import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="text-6xl mb-6">🐣❓</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-600 mb-6">
          This page seems to have wandered off like a free-range chicken. 
          Let's get you back to the coop!
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            🏠 Go Home
          </Link>
          <Link
            href="/dashboard"
            className="block px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-all duration-300"
          >
            🚀 Launch Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}