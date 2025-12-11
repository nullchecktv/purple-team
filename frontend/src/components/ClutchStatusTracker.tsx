'use client';

import { useState, useEffect, useRef } from 'react';

interface ClutchResponse {
  id: string;
  uploadTimestamp: string;
  imageKey: string;
  status: string;
  totalEggCount?: number;
  viableEggCount?: number;
  detectedEggCount?: number;
  processedEggCount?: number;
  chickenImageUrl?: string;
  errorMessage?: string;
  viabilityPercentage?: number;
  eggs: Array<{
    id: string;
    hatchLikelihood?: number;
    predictedChickBreed?: string;
    breedConfidence?: string;
    isCertified?: boolean;
    details?: {
      color: string;
      cleanliness: string;
      hardness: string;
      grade: string;
      shape: string;
      shellIntegrity: string;
      shellTexture: string;
      size: string;
      spotsMarkings: string;
    };
    notes: string;
    image?: string;
  }>;
}

interface ClutchStatusTrackerProps {
  clutchId: string;
  onComplete?: (clutch: ClutchResponse) => void;
}

const POLLING_INTERVAL = 10000; // 10 seconds
const MAX_POLLING_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get gradient colors for egg SVG based on detected color
const getEggGradientColors = (color?: string): { primary: string; secondary: string; accent?: string } => {
  if (!color) return { primary: '#D2691E', secondary: '#8B4513' }; // Default brown

  const normalizedColor = color.toLowerCase();

  if (normalizedColor.includes('white') || normalizedColor.includes('cream')) {
    return { primary: '#F8F9FA', secondary: '#E9ECEF' };
  }
  if (normalizedColor.includes('blue')) {
    return { primary: '#87CEEB', secondary: '#4682B4' };
  }
  if (normalizedColor.includes('green')) {
    return { primary: '#90EE90', secondary: '#228B22' };
  }
  if (normalizedColor.includes('speckled') || normalizedColor.includes('spotted')) {
    return { primary: '#DEB887', secondary: '#8B7355', accent: '#654321' };
  }
  if (normalizedColor.includes('dark') || normalizedColor.includes('chocolate')) {
    return { primary: '#8B4513', secondary: '#654321' };
  }
  if (normalizedColor.includes('brown') || normalizedColor.includes('tan')) {
    return { primary: '#D2691E', secondary: '#8B4513' };
  }
  if (normalizedColor.includes('pink') || normalizedColor.includes('rose')) {
    return { primary: '#FFB6C1', secondary: '#FF69B4' };
  }

  // Default brown
  return { primary: '#D2691E', secondary: '#8B4513' };
};

// SVG Egg Component with proper coloring
const EggIcon = ({ color, size = 'normal' }: { color?: string; size?: 'small' | 'normal' | 'large' }) => {
  const colors = getEggGradientColors(color);
  const sizeMap = {
    small: { width: 24, height: 30 },
    normal: { width: 32, height: 40 },
    large: { width: 40, height: 50 }
  };
  const { width, height } = sizeMap[size];
  const gradientId = `eggGradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} viewBox="0 0 32 48" className="drop-shadow-sm">
      <defs>
        <radialGradient id={gradientId} cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="70%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </radialGradient>
        {colors.accent && (
          <pattern id={`speckles-${gradientId}`} patternUnits="userSpaceOnUse" width="4" height="4">
            <rect width="4" height="4" fill={`url(#${gradientId})`} />
            <circle cx="2" cy="2" r="0.5" fill={colors.accent} opacity="0.6" />
          </pattern>
        )}
      </defs>

      {/* Main egg shape */}
      <ellipse
        cx="16"
        cy="28"
        rx="12"
        ry="16"
        fill={colors.accent ? `url(#speckles-${gradientId})` : `url(#${gradientId})`}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="0.5"
      />

      {/* Highlight for 3D effect */}
      <ellipse
        cx="13"
        cy="22"
        rx="4"
        ry="6"
        fill="rgba(255,255,255,0.3)"
        opacity="0.8"
      />
    </svg>
  );
};

// Clutch Completion View Component
interface ClutchCompletionViewProps {
  clutch: ClutchResponse;
}

function ClutchCompletionView({ clutch }: ClutchCompletionViewProps) {
  const [selectedChoice, setSelectedChoice] = useState<'future-flock' | string>('future-flock');
  const [selectedEgg, setSelectedEgg] = useState<string | null>(null);

  // Sort eggs by hatch likelihood (highest first)
  const sortedEggs = [...clutch.eggs].sort((a, b) => {
    const aLikelihood = a.hatchLikelihood || 0;
    const bLikelihood = b.hatchLikelihood || 0;
    return bLikelihood - aLikelihood;
  });

  const getSelectedImage = () => {
    if (selectedChoice === 'future-flock' && clutch.chickenImageUrl) {
      return {
        url: clutch.chickenImageUrl,
        title: 'Future Flock',
        description: 'Your predicted chicken flock. Hooray!'
      };
    }

    if (selectedEgg) {
      const egg = clutch.eggs.find(e => e.id === selectedEgg);
      if (egg?.image) {
        const eggIndex = sortedEggs.findIndex(e => e.id === selectedEgg) + 1;
        return {
          url: egg.image,
          title: `Egg #${eggIndex} Chick`,
          description: `Predicted ${egg.predictedChickBreed} chick from egg with ${egg.hatchLikelihood}% viability`
        };
      }
    }

    return {
      url: null,
      title: 'Future Flock',
      description: 'Select an egg to view its predicted chick'
    };
  };

  const getSelectedEggMetadata = () => {
    if (selectedEgg) {
      const egg = clutch.eggs.find(e => e.id === selectedEgg);
      if (egg) {
        const eggIndex = sortedEggs.findIndex(e => e.id === selectedEgg) + 1;
        return {
          egg,
          index: eggIndex
        };
      }
    }
    return null;
  };

  const selectedImage = getSelectedImage();
  const selectedEggData = getSelectedEggMetadata();

  // Function to get breed summary for future flock view
  const getBreedSummary = () => {
    const breedCounts: { [key: string]: number } = {};

    clutch.eggs
      .filter(egg => egg.predictedChickBreed && (egg.hatchLikelihood || 0) >= 70) // Only viable eggs
      .forEach(egg => {
        const breed = egg.predictedChickBreed!;
        breedCounts[breed] = (breedCounts[breed] || 0) + 1;
      });

    return Object.entries(breedCounts)
      .sort(([,a], [,b]) => b - a) // Sort by count descending
      .map(([breed, count]) => ({ breed, count }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-96">
        {/* Left: Image Display */}
        <div className="lg:col-span-2 border-r border-gray-200">
          <div className="p-6 h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              {selectedImage.url ? (
                <div className="w-full h-full flex flex-col">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedImage.title}</h3>
                    <p className="text-sm text-gray-600">{selectedImage.description}</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.title}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🐣</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedImage.title}</h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">{selectedImage.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Egg Selection Panel */}
        <div className="bg-gray-50">
          <div className="p-4 h-full flex flex-col">
            {/* Future Flock Option */}
            <button
              onClick={() => {
                setSelectedChoice('future-flock');
                setSelectedEgg(null);
              }}
              className={`w-full p-3 mb-3 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedChoice === 'future-flock'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Future Flock</span>
                <span className="text-2xl">🐓</span>
              </div>
            </button>

            {/* Egg List */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {sortedEggs.map((egg, index) => {
                const isSelected = selectedEgg === egg.id;
                const likelihood = egg.hatchLikelihood || 0;

                return (
                  <button
                    key={egg.id}
                    onClick={() => {
                      setSelectedChoice(egg.id);
                      setSelectedEgg(egg.id);
                    }}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>Egg #{index + 1}</span>
                          {egg.isCertified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              <span className="mr-1">✓</span>
                              Certified
                            </span>
                          )}
                        </div>
                        <div className="text-sm opacity-75">{likelihood}% viable</div>
                      </div>
                      <div className="relative">
                        <EggIcon color={egg.details?.color} size="normal" />
                        {egg.isCertified && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border border-white shadow-sm">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metadata Sections */}
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        {selectedEggData ? (
          // Show selected egg metadata
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Egg #{selectedEggData.index} Details
              </h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                (selectedEggData.egg.hatchLikelihood || 0) >= 90 ? 'bg-emerald-100 text-emerald-800' :
                (selectedEggData.egg.hatchLikelihood || 0) >= 75 ? 'bg-green-100 text-green-800' :
                (selectedEggData.egg.hatchLikelihood || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                (selectedEggData.egg.hatchLikelihood || 0) >= 40 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedEggData.egg.hatchLikelihood}% Viable
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Physical Characteristics */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Physical Characteristics</h5>
                {selectedEggData.egg.details ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Color:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedEggData.egg.details.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedEggData.egg.details.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shape:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedEggData.egg.details.shape}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grade:</span>
                        <span className="font-medium text-gray-900 uppercase">{selectedEggData.egg.details.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shell Texture:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedEggData.egg.details.shellTexture}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shell Integrity:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedEggData.egg.details.shellIntegrity}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No physical details available</div>
                )}
              </div>

              {/* Breed Information */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Breed Information</h5>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Predicted Breed:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {selectedEggData.egg.predictedChickBreed || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className={`font-medium capitalize ${
                        selectedEggData.egg.breedConfidence === 'high' ? 'text-green-800' :
                        selectedEggData.egg.breedConfidence === 'medium' ? 'text-yellow-800' :
                        'text-red-800'
                      }`}>
                        {selectedEggData.egg.breedConfidence || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hatch Likelihood:</span>
                      <span className="font-medium text-gray-900">{selectedEggData.egg.hatchLikelihood}%</span>
                    </div>
                    {selectedEggData.egg.details && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cleanliness:</span>
                          <span className="font-medium text-gray-900 capitalize">{selectedEggData.egg.details.cleanliness}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hardness:</span>
                          <span className="font-medium text-gray-900 capitalize">{selectedEggData.egg.details.hardness}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Analysis Notes */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Analysis Notes</h5>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  {selectedEggData.egg.notes ? (
                    <p className="text-sm text-gray-700">{selectedEggData.egg.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No analysis notes available</p>
                  )}
                  {selectedEggData.egg.details?.spotsMarkings && selectedEggData.egg.details.spotsMarkings !== 'none' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Markings:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedEggData.egg.details.spotsMarkings}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show clutch overview metadata
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Clutch Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Clutch Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Total Eggs: {clutch.detectedEggCount}</div>
                  <div>Viable Eggs: {clutch.eggs.filter(e => (e.hatchLikelihood || 0) >= 70).length}</div>
                  <div>Upload Date: {new Date(clutch.uploadTimestamp).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Analysis Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Viability Rate: {clutch.viabilityPercentage?.toFixed(1)}%</div>
                  <div>Best Egg: {Math.max(...clutch.eggs.map(e => e.hatchLikelihood || 0))}% viable</div>
                  <div>Status: {clutch.status}</div>
                </div>
              </div>
            </div>

            {/* Breed Predictions */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Breed Predictions</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {selectedChoice === 'future-flock' ? (
                    // Show breed summary for future flock
                    getBreedSummary().length > 0 ? (
                      getBreedSummary().map(({ breed, count }) => (
                        <div key={breed} className="flex justify-between items-center">
                          <span>{breed}</span>
                          <span className="font-medium text-gray-900">×{count}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic">No viable eggs with breed predictions</div>
                    )
                  ) : (
                    // Show individual breeds (existing behavior)
                    clutch.eggs
                      .filter(egg => egg.predictedChickBreed)
                      .slice(0, 3)
                      .map((egg, index) => (
                        <div key={index}>{egg.predictedChickBreed}</div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Egg List Component
interface EggListProps {
  eggs: Array<{
    id: string;
    hatchLikelihood?: number;
    predictedChickBreed?: string;
    breedConfidence?: string;
    isCertified?: boolean;
    details?: {
      color: string;
      cleanliness: string;
      hardness: string;
      grade: string;
      shape: string;
      shellIntegrity: string;
      shellTexture: string;
      size: string;
      spotsMarkings: string;
    };
    notes: string;
    image?: string;
  }>;
}

function EggList({ eggs }: EggListProps) {
  const [expandedEggs, setExpandedEggs] = useState<Set<string>>(new Set());

  // Sort eggs by hatch likelihood (highest first)
  const sortedEggs = [...eggs].sort((a, b) => {
    const aLikelihood = a.hatchLikelihood || 0;
    const bLikelihood = b.hatchLikelihood || 0;
    return bLikelihood - aLikelihood;
  });

  const toggleEggExpansion = (eggId: string) => {
    const newExpanded = new Set(expandedEggs);
    if (newExpanded.has(eggId)) {
      newExpanded.delete(eggId);
    } else {
      newExpanded.add(eggId);
    }
    setExpandedEggs(newExpanded);
  };

  const getHatchLikelihoodBadge = (likelihood: number) => {
    if (likelihood >= 90) return {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: '🌟',
      label: 'Excellent'
    };
    if (likelihood >= 75) return {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '✅',
      label: 'Very Good'
    };
    if (likelihood >= 60) return {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⚡',
      label: 'Good'
    };
    if (likelihood >= 40) return {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '⚠️',
      label: 'Fair'
    };
    return {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '❌',
      label: 'Poor'
    };
  };

  const getGradeBadge = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!eggs.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🥚</span>
            Egg Analysis
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 text-sm">No eggs detected in this clutch.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          <span>Egg Analysis</span>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {eggs.length} eggs
          </span>
        </h3>
      </div>

      {/* Egg List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {sortedEggs.map((egg, index) => {
            const isExpanded = expandedEggs.has(egg.id);
            const likelihood = egg.hatchLikelihood || 0;
            const badge = getHatchLikelihoodBadge(likelihood);

            return (
              <div key={egg.id} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm">
                {/* Collapsed View */}
                <button
                  onClick={() => toggleEggExpansion(egg.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Egg Icon & Number */}
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <EggIcon color={egg.details?.color} size="normal" />
                          {egg.isCertified && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border border-white shadow-sm">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center border border-orange-200">
                          <span className="text-xs font-semibold text-orange-800">{index + 1}</span>
                        </div>
                      </div>

                      {/* Hatch Likelihood */}
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
                          <span className="mr-1">{badge.icon}</span>
                          {likelihood}%
                        </span>
                        <span className="text-sm text-gray-600">{badge.label}</span>
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6 animate-fade-in">
                    <div className="space-y-6">

                      {/* Breed Info */}
                      {egg.predictedChickBreed && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Predicted Breed</h5>
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {egg.predictedChickBreed}
                            </span>
                            {egg.breedConfidence && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                egg.breedConfidence === 'high' ? 'bg-green-100 text-green-800' :
                                egg.breedConfidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {egg.breedConfidence} confidence
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Individual Chick Image */}
                      {egg.image && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-3">Predicted Chick</h5>
                          <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={egg.image}
                              alt={`Predicted chick for egg ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Physical Characteristics */}
                      {egg.details && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-3">Physical Characteristics</h5>
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Color:</span>
                                <span className="font-medium text-gray-900 capitalize">{egg.details.color}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Size:</span>
                                <span className="font-medium text-gray-900 capitalize">{egg.details.size}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Shape:</span>
                                <span className="font-medium text-gray-900 capitalize">{egg.details.shape}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Grade:</span>
                                <span className="font-medium text-gray-900 uppercase">{egg.details.grade}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Shell:</span>
                                <span className="font-medium text-gray-900 capitalize">{egg.details.shellTexture}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Integrity:</span>
                                <span className="font-medium text-gray-900 capitalize">{egg.details.shellIntegrity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cleanliness:</span>
                                <span className="font-medium text-gray-900 capitalize">{egg.details.cleanliness}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Hardness:</span>
                                <span className="font-medium text-gray-900 capitalize">{egg.details.hardness}</span>
                              </div>
                              {egg.details.spotsMarkings !== 'none' && (
                                <div className="flex justify-between col-span-2">
                                  <span className="text-gray-600">Markings:</span>
                                  <span className="font-medium text-gray-900 capitalize">{egg.details.spotsMarkings}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Analysis Notes */}
                      {egg.notes && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-2">Analysis Notes</h5>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900">{egg.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ClutchStatusTracker({ clutchId, onComplete }: ClutchStatusTrackerProps) {
  const [clutch, setClutch] = useState<ClutchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phraseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ridiculous Shinesty-style phrases for each phase
  const phraseSets = {
    'Detecting Eggs': [
      "Analyzing your image with AI magic...",
      "Teaching computers to see eggs...",
      "Scanning for ovoid life forms...",
      "Deploying advanced egg detection tech...",
      "Hunting for hidden egg treasures...",
      "Using satellite-grade egg spotting...",
      "Activating egg-finding superpowers...",
      "Consulting the egg detection matrix...",
      "Scanning with military-grade precision...",
      "Unleashing the egg-seeking algorithms..."
    ],
    'Determining Egg Viability': [
      "Evaluating egg quality and vibes...",
      "Consulting ancient chicken prophecies...",
      "Asking eggs about their life goals...",
      "Checking egg affairs and credentials...",
      "Measuring egg confidence levels...",
      "Finding eggs with main character energy...",
      "Scanning for future chicken greatness...",
      "Evaluating egg aura and general vibes...",
      "Checking if eggs are ready to glow up...",
      "Assessing egg world domination potential...",
      "Finding eggs with that special sauce...",
      "Consulting the mystical egg oracles...",
      "Checking egg credit scores thoroughly...",
      "Evaluating egg big league readiness...",
      "Measuring egg enthusiasm for existence...",
      "Finding eggs with legendary plot armor...",
      "Checking if eggs have done their yoga...",
      "Assessing egg hatching commitment levels...",
      "Evaluating egg street cred and rep...",
      "Finding eggs with that je ne sais quoi..."
    ],
    'Calculating Flock Numbers': [
      "Generating your future chicken empire...",
      "Calculating optimal flock dynamics...",
      "Designing your personalized chicken squad...",
      "Creating AI-powered chicken avatars...",
      "Building your custom poultry portfolio...",
      "Assembling your dream chicken team...",
      "Crafting your bespoke bird collection...",
      "Engineering your perfect flock formula...",
      "Designing chickens with artistic flair...",
      "Creating your signature chicken lineup..."
    ]
  };

  const fetchClutchStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/clutches/${clutchId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Clutch not found');
          return;
        }
        throw new Error('Failed to fetch clutch status');
      }

      const data: ClutchResponse = await response.json();
      setClutch(data);
      setLoading(false);
      setError(null);

      // Stop polling if terminal status reached
      if (data.status === 'Completed' || data.status === 'Error') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (data.status === 'Completed' && onComplete) {
          onComplete(data);
        }
      }
    } catch (err) {
      console.error('Error fetching clutch status:', err);
      // Don't stop polling on network errors, just log them
      setError(null);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchClutchStatus();

    // Set up polling interval
    intervalRef.current = setInterval(fetchClutchStatus, POLLING_INTERVAL);

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimedOut(true);
    }, MAX_POLLING_DURATION);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (phraseIntervalRef.current) {
        clearInterval(phraseIntervalRef.current);
      }
    };
  }, [clutchId]);

  // Set up phrase rotation for processing phases
  useEffect(() => {
    const currentStatus = clutch?.status;
    const hasPhrasesForStatus = currentStatus && phraseSets[currentStatus as keyof typeof phraseSets];

    if (hasPhrasesForStatus) {
      const phrases = phraseSets[currentStatus as keyof typeof phraseSets];
      phraseIntervalRef.current = setInterval(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }, 5000); // Change phrase every 5 seconds
    } else {
      if (phraseIntervalRef.current) {
        clearInterval(phraseIntervalRef.current);
        phraseIntervalRef.current = null;
      }
      setCurrentPhraseIndex(0); // Reset to first phrase
    }

    return () => {
      if (phraseIntervalRef.current) {
        clearInterval(phraseIntervalRef.current);
      }
    };
  }, [clutch?.status]);

  // Status display configuration
  const getStatusConfig = (status: string) => {
    const phrases = phraseSets[status as keyof typeof phraseSets];
    const message = phrases ? phrases[currentPhraseIndex] : null;

    switch (status) {
      case 'Uploaded':
        return {
          icon: '📤',
          message: 'Image uploaded successfully',
          color: 'blue',
          showSpinner: true
        };
      case 'Detecting Eggs':
        return {
          icon: '🔍',
          message: message || 'Analyzing your image...',
          color: 'purple',
          showSpinner: true
        };
      case 'Determining Egg Viability':
        return {
          icon: '✓',
          message: message || 'Evaluating egg quality...',
          color: 'indigo',
          showSpinner: true
        };
      case 'Calculating Flock Numbers':
        return {
          icon: '🐣',
          message: message || 'Generating your flock...',
          color: 'yellow',
          showSpinner: true
        };
      case 'Completed':
        return {
          icon: '✅',
          message: 'Analysis complete!',
          color: 'green',
          showSpinner: false
        };
      case 'Error':
        return {
          icon: '❌',
          message: 'An error occurred',
          color: 'red',
          showSpinner: false
        };
      default:
        return {
          icon: '⏳',
          message: 'Processing...',
          color: 'gray',
          showSpinner: true
        };
    }
  };

  if (loading && !clutch) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⏱️</span>
          <div>
            <p className="text-yellow-800 font-medium">Processing Timeout</p>
            <p className="text-yellow-600 text-sm">
              The analysis is taking longer than expected. Please refresh the page to check the status.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (!clutch) {
    return null;
  }

  const statusConfig = getStatusConfig(clutch.status);

  // Show error state
  if (clutch.status === 'Error') {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{statusConfig.icon}</span>
            <div>
              <p className="text-red-800 font-medium text-lg">{statusConfig.message}</p>
              <p className="text-red-600 text-sm mt-1">
                {clutch.errorMessage || 'An unexpected error occurred during processing'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show completed state with results
  if (clutch.status === 'Completed') {
    const viableCount = clutch.eggs.filter(egg => (egg.hatchLikelihood || 0) >= 70).length;
    const totalCount = clutch.detectedEggCount || 0;
    const viablePercentage = totalCount > 0 ? (viableCount / totalCount) * 100 : 0;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Success Header */}
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{statusConfig.icon}</span>
            <div>
              <p className="text-green-800 font-medium text-lg">{statusConfig.message}</p>
              <p className="text-green-600 text-sm">Your clutch analysis is ready</p>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Egg Count */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Eggs</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{totalCount}</p>
              </div>
              <div className="text-5xl">🥚</div>
            </div>
          </div>

          {/* Viable Egg Count */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Viable Eggs</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{viableCount}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {viablePercentage.toFixed(1)}% viability
                </p>
              </div>
              <div className="text-5xl">✓</div>
            </div>
          </div>
        </div>

        {/* Main Completion Layout */}
        <ClutchCompletionView clutch={clutch} />
      </div>
    );
  }

  // Show processing state
  return (
    <div className="space-y-6">
      <div className={`p-6 bg-${statusConfig.color}-50 border border-${statusConfig.color}-200 rounded-lg`}>
        <div className="flex items-center space-x-4">
          {statusConfig.showSpinner && (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{statusConfig.icon}</span>
              <p className={`text-${statusConfig.color}-800 font-medium text-lg`}>
                {statusConfig.message}
              </p>
            </div>
            <p className={`text-${statusConfig.color}-600 text-sm mt-1`}>
              This may take a few moments...
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['Detecting Eggs', 'Determining Egg Viability', 'Calculating Flock Numbers', 'Completed'].includes(clutch.status)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              ✓
            </div>
            <span className="text-sm font-medium text-gray-700">Image Uploaded</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['Determining Egg Viability', 'Calculating Flock Numbers', 'Completed'].includes(clutch.status)
                ? 'bg-green-500 text-white'
                : clutch.status === 'Detecting Eggs'
                ? 'bg-purple-500 text-white animate-pulse'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {clutch.status === 'Detecting Eggs' ? '⋯' : '✓'}
            </div>
            <span className="text-sm font-medium text-gray-700">Detecting Eggs</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['Calculating Flock Numbers', 'Completed'].includes(clutch.status)
                ? 'bg-green-500 text-white'
                : clutch.status === 'Determining Egg Viability'
                ? 'bg-purple-500 text-white animate-pulse'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {clutch.status === 'Determining Egg Viability' ? '⋯' : '✓'}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Determining Viability</span>
              {clutch.status === 'Determining Egg Viability' && clutch.processedEggCount !== undefined && clutch.detectedEggCount !== undefined && (
                <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                  {clutch.processedEggCount} of {clutch.detectedEggCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              clutch.status === 'Completed'
                ? 'bg-green-500 text-white'
                : clutch.status === 'Calculating Flock Numbers'
                ? 'bg-purple-500 text-white animate-pulse'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {clutch.status === 'Calculating Flock Numbers' ? '⋯' : '✓'}
            </div>
            <span className="text-sm font-medium text-gray-700">Generating Flock</span>
          </div>
        </div>
      </div>
    </div>
  );
}

