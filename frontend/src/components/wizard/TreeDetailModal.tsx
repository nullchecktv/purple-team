'use client';

import { useState, useEffect } from 'react';
import { TreeListing } from '@/types/tree';
import Image from 'next/image';
import { LoadingSpinner } from '../ui';

interface TreeDetailModalProps {
  treeId: string;
  onClose: () => void;
}

export default function TreeDetailModal({ treeId, onClose }: TreeDetailModalProps) {
  const [tree, setTree] = useState<TreeListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTreeDetails();
  }, [treeId]);

  const fetchTreeDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/trees/${treeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tree details');
      }

      const data = await response.json();
      setTree(data);
    } catch (err) {
      setError('Failed to load tree details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="p-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="p-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        )}

        {tree && (
          <>
            <div className="relative h-96 bg-gray-100">
              <Image
                src={tree.imageUrl}
                alt={tree.treeName}
                fill
                className="object-cover"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{tree.treeName}</h2>
                <p className="text-xl text-gray-600">{tree.vendorName}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <span className="text-4xl font-bold text-blue-600">${tree.price}</span>
                  {tree.deliveryFee > 0 && (
                    <p className="text-sm text-gray-600 mt-1">+ ${tree.deliveryFee} delivery</p>
                  )}
                  {tree.deliveryFee === 0 && (
                    <p className="text-sm text-green-600 mt-1">Free delivery</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(tree.qualityRating)}
                  </div>
                  <p className="text-sm text-gray-600">{tree.qualityRating} out of 5 stars</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{tree.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-600">Type</dt>
                      <dd className="text-gray-900 font-medium capitalize">{tree.treeType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Height</dt>
                      <dd className="text-gray-900 font-medium">{tree.height} feet</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Width</dt>
                      <dd className="text-gray-900 font-medium">{tree.specifications.width} feet</dd>
                    </div>
                    {tree.specifications.needleType && (
                      <div>
                        <dt className="text-sm text-gray-600">Needle Type</dt>
                        <dd className="text-gray-900 font-medium">{tree.specifications.needleType}</dd>
                      </div>
                    )}
                    {tree.specifications.lightCount && (
                      <div>
                        <dt className="text-sm text-gray-600">Lights</dt>
                        <dd className="text-gray-900 font-medium">{tree.specifications.lightCount} LEDs</dd>
                      </div>
                    )}
                    {tree.specifications.material && (
                      <div>
                        <dt className="text-sm text-gray-600">Material</dt>
                        <dd className="text-gray-900 font-medium">{tree.specifications.material}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery & Returns</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-600">Delivery Zones</dt>
                      <dd className="text-gray-900 font-medium">{tree.deliveryZones.join(', ')}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Return Window</dt>
                      <dd className="text-gray-900 font-medium">{tree.returnWindowDays} days</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Availability</dt>
                      <dd className={`font-medium ${tree.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {tree.inStock ? 'In Stock' : 'Out of Stock'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Social Popularity</dt>
                      <dd className="text-gray-900 font-medium">
                        {tree.socialPopularityScore}/100 ({tree.socialMentions.toLocaleString()} mentions)
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => alert('Purchase functionality would be implemented here')}
                >
                  Contact Vendor
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
