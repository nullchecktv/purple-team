'use client';

import Link from 'next/link';
import { useState } from 'react';
import ClutchesModal from './ClutchesModal';

export default function Header() {
  const [isClutchesModalOpen, setIsClutchesModalOpen] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 text-white shadow-2xl border-b border-primary-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-white text-2xl">🐣</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight group-hover:text-secondary-300 transition-colors duration-300">
                  CHMS
                </h1>
                <span className="text-primary-300 text-sm font-medium">
                  Quantum Incubation Platform
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-primary-700/50 hover:text-secondary-300"
              >
                Home
              </Link>
              <button
                onClick={() => setIsClutchesModalOpen(true)}
                className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-primary-700/50 hover:text-secondary-300 flex items-center space-x-2"
              >
                <span>🥚</span>
                <span>Clutches</span>
              </button>
              <Link
                href="/features"
                className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-primary-700/50 hover:text-secondary-300"
              >
                Features
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <ClutchesModal
        isOpen={isClutchesModalOpen}
        onClose={() => setIsClutchesModalOpen(false)}
      />
    </>
  );
}
