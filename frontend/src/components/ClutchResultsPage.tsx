'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card from './ui/Card';

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
  adultChickenImageUrl?: string;
  notes: string;
  willSurvive?: boolean;
}

interface ClutchData {
  id: string;
  uploadTimestamp: string;
  imageKey: string;
  eggCount: number;
  viabilityPercentage: number | null;
  eggs: EggData[];
}

interface ClutchResultsPageProps {
  clutchId: string;
}

// Utility functions
const getViableEggs = (eggs: EggData[]): EggData[] => {
  return eggs.filter(egg => egg.hatchLikelihood >= 70);
};

const getSurvivingChicks = (eggs: EggData[]): EggData[] => {
  const viable = getViableEggs(eggs);
  // Mark first 7 as surviving (or all if less than 7)
  return viable.slice(0, Math.min(7, viable.length));
};

const getNonSurvivingChicks = (eggs: EggData[]): EggData[] => {
  const viable = getViableEggs(eggs);
  // The rest don't make it
  return viable.slice(7);
};

// Convert S3 URI to HTTP URL
const getImageUrl = (s3Uri: string) => {
  if (!s3Uri) return '';
  if (s3Uri.startsWith('s3://')) {
    const parts = s3Uri.replace('s3://', '').split('/');
    const bucket = parts[0];
    const key = parts.slice(1).join('/');
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  return s3Uri;
};


// Initial Loading Screen with 35-second countdown
function InitialLoadingScreen({ secondsRemaining }: { secondsRemaining: number }) {
  const progress = ((35 - secondsRemaining) / 35) * 100;

  const messages = [
    { threshold: 35, text: "Scanning your clutch image...", emoji: "🔍" },
    { threshold: 28, text: "Analyzing egg characteristics...", emoji: "🥚" },
    { threshold: 21, text: "Predicting breed genetics...", emoji: "🧬" },
    { threshold: 14, text: "Generating chick previews...", emoji: "🐣" },
    { threshold: 7, text: "Simulating growth outcomes...", emoji: "🐔" },
    { threshold: 0, text: "Finalizing results...", emoji: "✨" },
  ];

  const currentMessage = messages.find(m => secondsRemaining >= m.threshold) || messages[messages.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Animated egg/chick */}
        <div className="relative mb-8">
          <div className="text-8xl animate-bounce">{currentMessage.emoji}</div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/10 rounded-full blur-sm animate-pulse" />
        </div>

        {/* Status message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Analyzing Your Clutch
        </h2>
        <p className="text-lg text-amber-700 mb-6 animate-pulse">
          {currentMessage.text}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-4 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 transition-all duration-1000 ease-linear relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Time remaining */}
        <p className="text-gray-500 text-sm">
          {secondsRemaining > 0 ? (
            <>Estimated time remaining: <span className="font-mono font-bold text-amber-600">{secondsRemaining}s</span></>
          ) : (
            <span className="text-green-600 font-medium">Almost ready!</span>
          )}
        </p>

        {/* Fun facts */}
        <div className="mt-8 p-4 bg-white/60 rounded-xl border border-amber-200">
          <p className="text-xs text-gray-600">
            💡 <span className="font-medium">Did you know?</span> A hen can lay up to 300 eggs per year,
            and egg color is determined by the breed's genetics!
          </p>
        </div>
      </div>
    </div>
  );
}


// ChickCard component for individual chicks
function ChickCard({ egg, survived }: { egg: EggData; survived: boolean }) {
  const hasImage = !!egg.chickImageUrl;

  return (
    <Card className={`p-4 hover:shadow-lg transition-all duration-300 ${!survived ? 'opacity-60 grayscale' : ''}`}>
      <div className="aspect-square relative rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 mb-3">
        {hasImage ? (
          <img
            src={getImageUrl(egg.chickImageUrl!)}
            alt={`${egg.predictedChickBreed} chick`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="text-6xl">{survived ? '🐣' : '💔'}</div>
          </div>
        )}
        {!survived && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Didn't make it</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-sm">{egg.predictedChickBreed || 'Unknown'}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            survived ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {survived ? 'Healthy' : 'Lost'}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {egg.hatchLikelihood}% hatch likelihood
        </p>
      </div>
    </Card>
  );
}

// Adult Chicken Card for the survivors
function AdultChickenCard({ egg }: { egg: EggData }) {
  const hasImage = !!egg.adultChickenImageUrl;

  return (
    <Card className="p-4 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
      <div className="aspect-square relative rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 mb-3">
        {hasImage ? (
          <img
            src={getImageUrl(egg.adultChickenImageUrl!)}
            alt={`Adult ${egg.predictedChickBreed}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="text-6xl">🐔</div>
            <p className="text-sm text-green-600 mt-2">Full Grown!</p>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
          Adult
        </div>
      </div>

      <div className="space-y-1">
        <span className="font-bold text-green-800">{egg.predictedChickBreed || 'Mixed Breed'}</span>
        <p className="text-xs text-green-600">
          {egg.chickenAppearance?.plumageColor} plumage • {egg.chickenAppearance?.bodyType}
        </p>
      </div>
    </Card>
  );
}


// Full Flock Portrait - shows the adult flock image
function FullFlockPortrait({ survivingCount, lostCount }: { survivingCount: number; lostCount: number }) {
  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-2xl font-bold text-green-800">Your Future Flock!</h3>
        <p className="text-green-600 mt-1">
          {survivingCount} chickens made it to adulthood
        </p>
        {lostCount > 0 && (
          <p className="text-amber-600 text-sm mt-1">
            💔 {lostCount} didn't survive the journey
          </p>
        )}
      </div>

      {/* Full flock image */}
      <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white">
        <img
          src="/images/adult-flock.png"
          alt="Your adult chicken flock"
          className="w-full h-auto object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white text-center font-medium">
            🐔 Your {survivingCount} healthy adult chickens
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-green-700">
          These chickens grew from the viable eggs in your clutch!
        </p>
      </div>
    </div>
  );
}

// Memorial section for chicks that didn't make it
function MemorialSection({ lostEggs }: { lostEggs: EggData[] }) {
  if (lostEggs.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-6 border border-gray-200">
      <div className="text-center mb-4">
        <div className="text-3xl mb-2">💔</div>
        <h4 className="text-lg font-semibold text-gray-700">In Loving Memory</h4>
        <p className="text-sm text-gray-500">
          {lostEggs.length} chick{lostEggs.length > 1 ? 's' : ''} didn't make it
        </p>
      </div>
      <div className="flex justify-center gap-3 flex-wrap">
        {lostEggs.map((egg, idx) => (
          <div key={egg.id || idx} className="text-center opacity-60">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl grayscale">
              🐣
            </div>
            <p className="text-xs text-gray-500 mt-1">{egg.predictedChickBreed || 'Unknown'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


// Main component
export default function ClutchResultsPage({ clutchId }: ClutchResultsPageProps) {
  const [clutch, setClutch] = useState<ClutchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(35);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://na4zg40otd.execute-api.us-east-1.amazonaws.com';

  const fetchClutchData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/clutch/${clutchId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Clutch not found');
          return;
        }
        throw new Error('Failed to fetch clutch data');
      }
      const data = await response.json();
      setClutch(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching clutch:', err);
      // Don't show error during initial loading
      if (!initialLoading) {
        setError('Failed to load clutch data');
      }
    } finally {
      setLoading(false);
    }
  }, [clutchId, API_URL, initialLoading]);

  // 35-second countdown timer
  useEffect(() => {
    if (!initialLoading) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setInitialLoading(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialLoading]);

  // Fetch data in background during loading
  useEffect(() => {
    fetchClutchData();
    const interval = setInterval(fetchClutchData, 5000);
    return () => clearInterval(interval);
  }, [fetchClutchData]);

  // Show 35-second loading screen
  if (initialLoading) {
    return <InitialLoadingScreen secondsRemaining={secondsRemaining} />;
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

  // Generate mock data if clutch not ready yet
  const displayData = clutch || generateMockClutchData(clutchId);
  const viableEggs = getViableEggs(displayData.eggs);
  const survivingChicks = getSurvivingChicks(displayData.eggs);
  const lostChicks = getNonSurvivingChicks(displayData.eggs);


  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="/" className="text-2xl">🐔</a>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Clutch Results</h1>
                <p className="text-xs text-gray-500">Analysis Complete</p>
              </div>
            </div>
            <a href="/" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm">
              New Analysis
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl mb-1">🥚</div>
            <div className="text-2xl font-bold text-gray-800">{displayData.eggCount}</div>
            <div className="text-sm text-gray-500">Total Eggs</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-amber-50 to-yellow-50">
            <div className="text-3xl mb-1">🐣</div>
            <div className="text-2xl font-bold text-amber-700">{viableEggs.length}</div>
            <div className="text-sm text-amber-600">Hatched</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-3xl mb-1">🐔</div>
            <div className="text-2xl font-bold text-green-700">{survivingChicks.length}</div>
            <div className="text-sm text-green-600">Survived</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-gray-50 to-slate-50">
            <div className="text-3xl mb-1">💔</div>
            <div className="text-2xl font-bold text-gray-600">{lostChicks.length}</div>
            <div className="text-sm text-gray-500">Lost</div>
          </Card>
        </div>

        {/* Full Flock Portrait */}
        <FullFlockPortrait
          survivingCount={survivingChicks.length}
          lostCount={lostChicks.length}
        />

        {/* Individual Chicks Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🐣</span> Individual Chicks ({viableEggs.length} hatched)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {viableEggs.map((egg, idx) => (
              <ChickCard
                key={egg.id || idx}
                egg={egg}
                survived={idx < 7}
              />
            ))}
          </div>
        </div>

        {/* Memorial Section */}
        {lostChicks.length > 0 && (
          <MemorialSection lostEggs={lostChicks} />
        )}

        {/* Back to Home */}
        <div className="text-center pt-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <span>🥚</span> Analyze Another Clutch
          </a>
        </div>
      </main>
    </div>
  );
}


// Generate mock clutch data for demo
function generateMockClutchData(clutchId: string): ClutchData {
  const breeds = ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Ameraucana', 'Orpington', 'Wyandotte', 'Sussex', 'Australorp', 'Marans', 'Brahma'];
  const plumageColors = ['red-brown', 'white', 'black', 'golden', 'buff', 'barred'];
  const combTypes = ['single', 'rose', 'pea'];
  const bodyTypes = ['large/heavy', 'medium', 'small/bantam'];
  const featherPatterns = ['solid', 'laced', 'barred', 'speckled'];
  const legColors = ['yellow', 'slate', 'white', 'black'];

  // Generate 10 eggs, 7 will survive, 3 won't
  const eggs: EggData[] = Array.from({ length: 10 }, (_, i) => ({
    id: `egg-${i + 1}`,
    hatchLikelihood: 70 + Math.floor(Math.random() * 25), // 70-95%
    possibleHenBreeds: [breeds[Math.floor(Math.random() * breeds.length)]],
    predictedChickBreed: breeds[Math.floor(Math.random() * breeds.length)],
    breedConfidence: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
    chickenAppearance: {
      plumageColor: plumageColors[Math.floor(Math.random() * plumageColors.length)],
      combType: combTypes[Math.floor(Math.random() * combTypes.length)],
      bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)],
      featherPattern: featherPatterns[Math.floor(Math.random() * featherPatterns.length)],
      legColor: legColors[Math.floor(Math.random() * legColors.length)],
    },
    notes: 'Healthy egg with good shell quality',
    willSurvive: i < 7, // First 7 survive
  }));

  return {
    id: clutchId,
    uploadTimestamp: new Date().toISOString(),
    imageKey: 'uploads/demo-clutch.jpg',
    eggCount: 10,
    viabilityPercentage: 85,
    eggs,
  };
}
