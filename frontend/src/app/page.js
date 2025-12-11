'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import ClutchStatusTracker from '@/components/ClutchStatusTracker';
import ClutchesModal from '@/components/ClutchesModal';

function HomeContent() {
  const searchParams = useSearchParams();
  const [clutchId, setClutchId] = useState(null);
  const [isClutchesModalOpen, setIsClutchesModalOpen] = useState(false);
  const [showUploadFlow, setShowUploadFlow] = useState(false);

  useEffect(() => {
    const clutchIdParam = searchParams.get('clutchId');
    if (clutchIdParam) {
      setClutchId(clutchIdParam);
      setShowUploadFlow(false);
    } else {
      setShowUploadFlow(true);
    }
  }, [searchParams]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 backdrop-blur-sm border-b border-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-bold">🥚</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Chicken Vision</h1>
                <p className="text-xs text-primary-200">AI-Powered Egg Analysis Since 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsClutchesModalOpen(true)}
                className="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 border border-primary-400/30 hover:border-primary-400/50"
              >
                <span className="text-sm">🥚</span>
                <span className="font-medium">Clutches</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow w-full">
        {clutchId && !showUploadFlow ? (
          // Direct results view when clutchId is provided - use 75% width
          <div className="py-12 animate-fade-in px-4 sm:px-6 lg:px-8">
            <div className="w-3/4 mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-2xl">🐣</span>
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Clutch Analysis Results
                </h1>
                <p className="text-neutral-600">
                  Viewing results for clutch: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{clutchId}</span>
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-200 p-8">
                <ClutchStatusTracker
                  clutchId={clutchId}
                  onComplete={() => {
                    // Optional: handle completion
                  }}
                />

                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <button
                    onClick={() => {
                      // Show upload flow instead of clearing clutchId immediately
                      setShowUploadFlow(true);
                      // Update URL to remove clutchId param
                      window.history.pushState({}, '', window.location.pathname);
                      // Clear clutchId after a brief delay to prevent hooks reordering
                      setTimeout(() => setClutchId(null), 100);
                    }}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                  >
                    Count More Chickens Before They Hatch
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Normal upload flow
          <div className="py-20 text-center animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg animate-bounce-gentle">
                <span className="text-white text-3xl">🐣</span>
              </div>

              <h1 className="text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
                Don't Count Your Chickens...
              </h1>

              <p className="text-xl text-neutral-700 mb-12 leading-relaxed">
                Actually, scratch that. Let's count them anyway.
                <br />
                <span className="text-primary-600 font-medium">We'll tell you exactly how many will hatch and what they'll look like.</span> 🐣✨
              </p>

              <div className="mt-12 p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-200 animate-slide-up">
                <div className="mb-6 text-left">
                  <p className="text-neutral-700 mt-2">
                    Upload your eggs and we'll predict which ones will hatch into adorable chicks.
                    <br />
                    <span className="text-sm italic text-secondary-600">Warning: Your grandmother's advice has been officially obsoleted.</span>
                  </p>
                </div>
                {showUploadFlow && (
                  <ImageUpload
                    onComplete={(completedClutchId) => {
                      // When upload completes, redirect to results view
                      setClutchId(completedClutchId);
                      setShowUploadFlow(false);
                      // Update URL to include clutchId param
                      window.history.pushState({}, '', `?clutchId=${completedClutchId}`);
                    }}
                  />
                )}
              </div>

              {/* Feature highlights */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-primary-100 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">🔍</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">AI Analysis</h3>
                  <p className="text-sm text-neutral-600">Advanced computer vision detects and analyzes each egg</p>
                </div>

                <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-accent-100 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Hatch Prediction</h3>
                  <p className="text-sm text-neutral-600">Get accurate likelihood scores for successful hatching</p>
                </div>

                <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-secondary-100 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">🐥</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Chick Preview</h3>
                  <p className="text-sm text-neutral-600">See what your future chickens will look like</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">🥚</span>
              </div>
              <span className="text-sm text-neutral-600">Chicken Vision - AI-Powered Egg Analysis</span>
            </div>
            <div className="text-sm text-neutral-500">
              Seeing the future in every shell since 2025
            </div>
          </div>
        </div>
      </footer>

      <ClutchesModal
        isOpen={isClutchesModalOpen}
        onClose={() => setIsClutchesModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
