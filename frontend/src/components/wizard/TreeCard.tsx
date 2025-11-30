'use client';

import { MatchScore, FilterCriteria } from '@/types/tree';
import Image from 'next/image';

interface TreeCardProps {
  matchScore: MatchScore;
  criteria: FilterCriteria;
  onClick: () => void;
}

export default function TreeCard({ matchScore, criteria, onClick }: TreeCardProps) {
  const { tree, matchDetails, matchPercentage } = matchScore;
  const isPerfectMatch = matchPercentage === 100;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden group border border-gray-200/50 hover:border-green-300/50 hover:scale-[1.02]"
    >
      <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src={tree.imageUrl}
          alt={tree.treeName}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {isPerfectMatch && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl animate-pulse">
            ✨ Perfect Match
          </div>
        )}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-green-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
          {matchPercentage.toFixed(0)}% Match
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">{tree.treeName}</h3>
        <p className="text-gray-500 mb-4 text-sm">{tree.vendorName}</p>

        <div className="flex items-center justify-between mb-6">
          <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent">${tree.price}</span>
          <div className="flex items-center gap-2">
            {renderStars(tree.qualityRating)}
            <span className="text-sm text-gray-600">({tree.qualityRating})</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={matchDetails.deliveryMatch ? 'text-green-600' : 'text-gray-400'}>
              {matchDetails.deliveryMatch ? '✓' : '○'}
            </span>
            <span className="text-gray-700">
              {tree.deliveryZones.includes(criteria.location.deliveryZone) 
                ? `Delivers to ${criteria.location.deliveryZone}` 
                : 'Delivery not available'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className={matchDetails.returnMatch ? 'text-green-600' : 'text-gray-400'}>
              {matchDetails.returnMatch ? '✓' : '○'}
            </span>
            <span className="text-gray-700">{tree.returnWindowDays}-day returns</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className={matchDetails.popularityMatch ? 'text-green-600' : 'text-gray-400'}>
              {matchDetails.popularityMatch ? '✓' : '○'}
            </span>
            <span className="text-gray-700">
              {tree.socialPopularityScore >= 80 ? '🔥 Trending' : 
               tree.socialPopularityScore >= 50 ? '👍 Popular' : '🌱 Hidden Gem'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {matchDetails.priceMatch && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              In Budget
            </span>
          )}
          {matchDetails.qualityMatch && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              High Quality
            </span>
          )}
          {tree.treeType === 'artificial' && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              Artificial
            </span>
          )}
          {tree.treeType === 'real' && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Real Tree
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
