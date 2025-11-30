export interface TreeListing {
  id: string;
  vendorId: string;
  vendorName: string;
  treeName: string;
  treeType: 'real' | 'artificial';
  height: number;
  price: number;
  qualityRating: number;
  imageUrl: string;
  deliveryZones: string[];
  deliveryFee: number;
  returnWindowDays: number;
  socialPopularityScore: number;
  socialMentions: number;
  description: string;
  specifications: {
    width: number;
    needleType?: string;
    lightCount?: number;
    material?: string;
  };
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCriteria {
  location: {
    city: string;
    zipCode: string;
    deliveryZone: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  minQuality: number;
  delivery: {
    required: boolean;
    preferred: boolean;
  };
  minReturnDays: number;
  popularityLevel: 'high' | 'medium' | 'low' | 'any';
}

export interface MatchScore {
  tree: TreeListing;
  score: number;
  matchDetails: {
    priceMatch: boolean;
    qualityMatch: boolean;
    deliveryMatch: boolean;
    returnMatch: boolean;
    popularityMatch: boolean;
  };
  matchPercentage: number;
}
