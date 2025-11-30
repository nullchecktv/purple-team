'use client';

import { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';
import { SkeletonCard } from './ui/SkeletonLoader';
import FadeIn from './ui/FadeIn';

interface Tree {
  id: string;
  species: string;
  height: number;
  price: number;
  condition: string;
  description: string;
  storeLocation: string;
  createdAt: string;
  updatedAt: string;
}

interface TreeListProps {
  trees: Tree[];
  loading: boolean;
  onEdit: (tree: Tree) => void;
  onDelete: (tree: Tree) => void;
  storeLocations: string[];
}

export default function TreeList({ trees, loading, onEdit, onDelete, storeLocations }: TreeListProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredTrees = selectedLocation
    ? trees.filter(tree => tree.storeLocation === selectedLocation)
    : trees;

  const handleDeleteClick = (tree: Tree) => {
    setDeleteConfirm(tree.id);
  };

  const handleDeleteConfirm = (tree: Tree) => {
    onDelete(tree);
    setDeleteConfirm(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <EmptyState
        title="No Christmas Trees Yet"
        description="Get started by adding your first Christmas tree to the inventory."
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      {storeLocations.length > 0 && (
        <div className="flex items-center gap-4">
          <label htmlFor="location-filter" className="text-sm font-medium text-gray-700">
            Filter by Store:
          </label>
          <select
            id="location-filter"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Locations</option>
            {storeLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tree Grid */}
      {filteredTrees.length === 0 ? (
        <EmptyState
          title="No Trees Found"
          description={`No trees found at ${selectedLocation}. Try selecting a different location.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrees.map((tree, index) => (
            <FadeIn key={tree.id} delay={index * 50}>
              <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{tree.species}</h3>
                    <p className="text-sm text-gray-600">{tree.storeLocation}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {tree.condition}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Height</p>
                    <p className="font-semibold text-gray-900">{tree.height} ft</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-semibold text-gray-900">${tree.price.toFixed(2)}</p>
                  </div>
                </div>

                {tree.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">{tree.description}</p>
                )}

                {deleteConfirm === tree.id ? (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <p className="text-sm text-red-600 font-medium">
                      Are you sure you want to delete this tree?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteConfirm(tree)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleDeleteCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onEdit(tree)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(tree)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </Card>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
