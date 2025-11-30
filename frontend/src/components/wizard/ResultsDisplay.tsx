'use client';

import { useState, useEffect } from 'react';
import { FilterCriteria, MatchScore } from '@/types/tree';
import TreeCard from './TreeCard';
import { LoadingSpinner, EmptyState } from '../ui';

interface ResultsDisplayProps {
  criteria: FilterCriteria;
  onStartOver: () => void;
  onSelectTree: (treeId: string) => void;
}

export default function ResultsDisplay({ criteria, onStartOver, onSelectTree }: ResultsDisplayProps) {
  const [results, setResults] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [criteria]);

  const fetchResults = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const params = new URLSearchParams({
        deliveryZone: criteria.location.deliveryZone,
        minPrice: criteria.priceRange.min.toString(),
        maxPrice: criteria.priceRange.max.toString(),
        minQuality: criteria.minQuality.toString(),
        deliveryRequired: criteria.delivery.required.toString(),
        minReturnDays: criteria.minReturnDays.toString(),
        popularityLevel: criteria.popularityLevel
      });

      const response = await fetch(`${apiUrl}/trees/search?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to load results. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={fetchResults}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 animate-fade-in">
        <div className="text-center">
          <div className="text-7xl mb-6">🎄</div>
          <EmptyState
            title="No trees found"
            description="We couldn't find any trees matching all your criteria. Try adjusting your filters."
          />
          <div className="mt-8">
            <button
              onClick={onStartOver}
              className="bg-gradient-to-r from-green-600 to-red-600 text-white px-10 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              ← Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <div className="text-7xl mb-4">🎄</div>
        <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Your Perfect Trees</h2>
        <p className="text-xl text-gray-500">
          Found {results.length} {results.length === 1 ? 'tree' : 'trees'} matching your criteria
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {results.map((result, index) => (
          <div
            key={result.tree.id}
            style={{ animationDelay: `${index * 100}ms` }}
            className="animate-fade-in"
          >
            <TreeCard
              matchScore={result}
              criteria={criteria}
              onClick={() => onSelectTree(result.tree.id)}
            />
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onStartOver}
          className="bg-white/80 backdrop-blur-xl border-2 border-gray-200 text-gray-700 px-10 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
        >
          ← Start Over
        </button>
      </div>
    </div>
  );
}
