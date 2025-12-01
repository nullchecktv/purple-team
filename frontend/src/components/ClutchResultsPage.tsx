'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';

interface ChickenAppearance {
  plumageColor: string;
  combType: string;
  bodyType: string;
  featherPattern: string;
  legColor: string;
}

interface EggData {
  id: string;
  hatchLikelihood: number;
  possibleHenBreeds: string[];
  predictedChickBreed: string;
  breedConfidence: string;
  chickenAppearance: ChickenAppearance;
  chickImageUrl?: string;
  notes: string;
}

interface ClutchData {
  id: string;
  uploadTimestamp: string;
  imageKey: string;
  eggCount: number;
  viabilityPercentage: number | null;
  eggs: EggData[];
}

type ProcessingStatus = 'analyzing' | 'generating_images' | 'complete';

interface ClutchResultsPageProps {
  clutchId: string;
}

// Utility functions
const getViableEggs = (eggs: EggData[]): EggData[] => {
  return eggs.filter(egg => egg.hatchLikelihood >= 70);
};

const getProcessingStatus = (clutch: ClutchData): ProcessingStatus => {
  if (clutch.eggs.length === 0) return 'analyzing';
  const viableEggs = getViableEggs(clutch.eggs);
  if (viableEggs.length === 0) return 'complete';
  const eggsWithImages = viableEggs.filter(e => e.chickImageUrl);
  if (eggsWithImages.length < viableEggs.length) return 'generating_images';
  return 'complete';
};


const getProgress = (clutch: ClutchData): number => {
  if (clutch.eggs.length === 0) return 0;
  const viableEggs = getViableEggs(clutch.eggs);
  if (viableEggs.length === 0) return 100;
  const eggsWithImages = viableEggs.filter(e => e.chickImageUrl).length;
  return Math.round((eggsWithImages / viableEggs.length) * 100);
};

// ChickCard component
function ChickCard({ egg }: { egg: EggData }) {
  const isViable = egg.hatchLikelihood >= 70;
  const hasImage = !!egg.chickImageUrl;

  // Convert S3 URI to HTTP URL
  const getImageUrl = (s3Uri: string) => {
    if (s3Uri.startsWith('s3://')) {
      const parts = s3Uri.replace('s3://', '').split('/');
      const bucket = parts[0];
      const key = parts.slice(1).join('/');
      return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
    return s3Uri;
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300">
      <div className="aspect-square relative rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 mb-3">
        {hasImage ? (
          <img
            src={getImageUrl(egg.chickImageUrl!)}
            alt={`${egg.predictedChickBreed} chick`}
            className="w-full h-full object-cover"
          />
        ) : isViable ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="animate-pulse">
              <div className="text-6xl mb-2">🐣</div>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto" />
            </div>
            <p className="text-sm text-amber-600 mt-2">Generating...</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="text-6xl opacity-50">🥚</div>
            <p className="text-sm text-gray-400 mt-2">Not viable</p>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">{egg.predictedChickBreed || 'Unknown Breed'}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            egg.hatchLikelihood >= 70
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {egg.hatchLikelihood}%
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {egg.breedConfidence} confidence
        </p>
      </div>
    </Card>
  );
}


// FullPortrait component
function FullPortrait({ eggs }: { eggs: EggData[] }) {
  const viableEggs = getViableEggs(eggs);
  const breeds = [...new Set(viableEggs.map(e => e.predictedChickBreed).filter(Boolean))];

  const getImageUrl = (s3Uri: string) => {
    if (s3Uri.startsWith('s3://')) {
      const parts = s3Uri.replace('s3://', '').split('/');
      const bucket = parts[0];
      const key = parts.slice(1).join('/');
      return `https://${bucket}.s3.amazonaws.com/${key}`;
    }
    return s3Uri;
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-2xl font-bold text-green-800">Your Future Flock!</h3>
        <p className="text-green-600">{viableEggs.length} chicks will hatch</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {viableEggs.map(egg => (
          <div key={egg.id} className="w-24 h-24 rounded-xl overflow-hidden shadow-lg border-2 border-white">
            {egg.chickImageUrl && (
              <img
                src={getImageUrl(egg.chickImageUrl)}
                alt={egg.predictedChickBreed}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-green-700">
          Breeds: {breeds.join(', ') || 'Mixed'}
        </p>
      </div>
    </div>
  );
}


// Main component
export default function ClutchResultsPage({ clutchId }: ClutchResultsPageProps) {
  const [clutch, setClutch] = useState<ClutchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://na4zg40otd.execute-api.us-east-1.amazonaws.com';

  const fetchClutchData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/clutch/${clutchId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Clutch not found');
          setIsPolling(false);
          return;
        }
        throw new Error('Failed to fetch clutch data');
      }
      const data = await response.json();
      setClutch(data);
      setError(null);

      // Stop polling if complete
      if (data.eggs.length > 0) {
        const status = getProcessingStatus(data);
        if (status === 'complete') {
          setIsPolling(false);
        }
      }
    } catch (err) {
      console.error('Error fetching clutch:', err);
      setError('Failed to load clutch data');
    } finally {
      setLoading(false);
    }
  }, [clutchId, API_URL]);

  useEffect(() => {
    fetchClutchData();

    const interval = setInterval(() => {
      if (isPolling) {
        fetchClutchData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchClutchData, isPolling]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading clutch data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600">{error}</p>
          <a href="/" className="mt-4 inline-block px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Go Home
          </a>
        </Card>
      </div>
    );
  }

  if (!clutch) return null;

  const status = getProcessingStatus(clutch);
  const progress = getProgress(clutch);
  const viableEggs = getViableEggs(clutch.eggs);
  const eggsWithImages = viableEggs.filter(e => e.chickImageUrl).length;


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="/" className="text-2xl">🐔</a>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Clutch Analysis</h1>
                <p className="text-xs text-gray-500">ID: {clutchId.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isPolling && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <div className="animate-pulse w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-sm">Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Status Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {status === 'analyzing' && '🔍 Analyzing eggs...'}
                {status === 'generating_images' && '🎨 Generating chick images...'}
                {status === 'complete' && '✅ Analysis complete!'}
              </h2>
              <p className="text-gray-600">
                {status === 'generating_images' && `${eggsWithImages} of ${viableEggs.length} images ready`}
                {status === 'complete' && 'All chick images have been generated'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-sm text-gray-500 mt-1">{progress}%</p>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl mb-1">🥚</div>
            <div className="text-2xl font-bold text-gray-800">{clutch.eggCount}</div>
            <div className="text-sm text-gray-500">Total Eggs</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-3xl mb-1">🐣</div>
            <div className="text-2xl font-bold text-green-700">{viableEggs.length}</div>
            <div className="text-sm text-green-600">Will Hatch</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-2xl font-bold text-gray-800">
              {clutch.viabilityPercentage?.toFixed(0) || 0}%
            </div>
            <div className="text-sm text-gray-500">Avg Viability</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl mb-1">🖼️</div>
            <div className="text-2xl font-bold text-gray-800">{eggsWithImages}</div>
            <div className="text-sm text-gray-500">Images Ready</div>
          </Card>
        </div>

        {/* Full Portrait (when complete) */}
        {status === 'complete' && viableEggs.length > 0 && (
          <FullPortrait eggs={clutch.eggs} />
        )}

        {/* Individual Chick Cards */}
        {clutch.eggs.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Individual Eggs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {clutch.eggs.map(egg => (
                <ChickCard key={egg.id} egg={egg} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
