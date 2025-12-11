'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Clutch {
  id: string;
  uploadTimestamp: string;
  imageKey: string;
  eggCount: number;
  viabilityPercentage: number | null;
}

interface ClutchesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClutchesModal({ isOpen, onClose }: ClutchesModalProps) {
  const [clutches, setClutches] = useState<Clutch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchClutches();
    }
  }, [isOpen]);

  const fetchClutches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clutches`);
      if (!response.ok) {
        throw new Error('Failed to fetch clutches');
      }

      const data = await response.json();
      setClutches(data.clutches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clutches');
    } finally {
      setLoading(false);
    }
  };

  const handleClutchClick = (clutchId: string) => {
    router.push(`/?clutchId=${clutchId}`);
    onClose();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatViability = (percentage: number | null) => {
    if (percentage === null) return 'Analyzing...';
    return `${Math.round(percentage)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🥚</span>
            </div>
            <h2 className="text-xl font-bold text-white">Your Clutches</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors duration-200 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              <span className="ml-3 text-neutral-600">Loading clutches...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <p className="text-red-600 font-medium mb-2">Failed to load clutches</p>
              <p className="text-neutral-600 text-sm mb-4">{error}</p>
              <button
                onClick={fetchClutches}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : clutches.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-neutral-400 text-2xl">🥚</span>
              </div>
              <p className="text-neutral-600 font-medium mb-2">No clutches yet</p>
              <p className="text-neutral-500 text-sm">Upload your first clutch to get started!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {clutches.map((clutch) => (
                <div
                  key={clutch.id}
                  onClick={() => handleClutchClick(clutch.id)}
                  className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <span className="text-white text-lg">🐣</span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 group-hover:text-primary-700 transition-colors duration-200">
                            {formatDate(clutch.uploadTimestamp)}
                          </p>
                          <p className="text-sm text-neutral-500">
                            Clutch ID: {clutch.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-neutral-600">Eggs:</span>
                          <span className="font-medium text-neutral-900 bg-neutral-100 px-2 py-1 rounded">
                            {clutch.eggCount}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-neutral-600">Viability:</span>
                          <span className={`font-medium px-2 py-1 rounded ${
                            clutch.viabilityPercentage === null
                              ? 'bg-yellow-100 text-yellow-800'
                              : clutch.viabilityPercentage >= 70
                              ? 'bg-green-100 text-green-800'
                              : clutch.viabilityPercentage >= 40
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {formatViability(clutch.viabilityPercentage)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-primary-400 group-hover:text-primary-600 transition-colors duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
