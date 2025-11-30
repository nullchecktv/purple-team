import { TreeListing, FilterCriteria, MatchScore } from '../types/tree';

export function calculateMatchScore(tree: TreeListing, criteria: FilterCriteria): MatchScore {
  const matchDetails = {
    priceMatch: false,
    qualityMatch: false,
    deliveryMatch: false,
    returnMatch: false,
    popularityMatch: false
  };

  // Price match
  if (tree.price >= criteria.priceRange.min && tree.price <= criteria.priceRange.max) {
    matchDetails.priceMatch = true;
  }

  // Quality match
  if (tree.qualityRating >= criteria.minQuality) {
    matchDetails.qualityMatch = true;
  }

  // Delivery match
  if (criteria.delivery.required) {
    if (tree.deliveryZones.includes(criteria.location.deliveryZone)) {
      matchDetails.deliveryMatch = true;
    }
  } else {
    matchDetails.deliveryMatch = true;
  }

  // Return policy match
  if (tree.returnWindowDays >= criteria.minReturnDays) {
    matchDetails.returnMatch = true;
  }

  // Popularity match
  const popularityLevel = criteria.popularityLevel;
  if (popularityLevel === 'any') {
    matchDetails.popularityMatch = true;
  } else if (popularityLevel === 'high' && tree.socialPopularityScore >= 80) {
    matchDetails.popularityMatch = true;
  } else if (popularityLevel === 'medium' && tree.socialPopularityScore >= 50 && tree.socialPopularityScore < 80) {
    matchDetails.popularityMatch = true;
  } else if (popularityLevel === 'low' && tree.socialPopularityScore < 50) {
    matchDetails.popularityMatch = true;
  }

  // Calculate match percentage
  const totalCriteria = Object.keys(matchDetails).length;
  const matchedCriteria = Object.values(matchDetails).filter(v => v).length;
  const matchPercentage = (matchedCriteria / totalCriteria) * 100;

  return {
    tree,
    score: matchPercentage,
    matchDetails,
    matchPercentage
  };
}

export function filterAndScoreTrees(trees: TreeListing[], criteria: FilterCriteria): MatchScore[] {
  const scoredTrees = trees
    .map(tree => calculateMatchScore(tree, criteria))
    .filter(result => Object.values(result.matchDetails).every(v => v))
    .sort((a, b) => b.score - a.score);

  return scoredTrees;
}
