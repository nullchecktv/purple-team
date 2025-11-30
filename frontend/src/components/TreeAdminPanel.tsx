'use client';

import { useState, useEffect } from 'react';
import TreeList from './TreeList';
import TreeForm from './TreeForm';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';
import Card from './ui/Card';

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

export default function TreeAdminPanel() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/trees`);
      if (!response.ok) {
        throw new Error('Failed to fetch trees');
      }
      const data = await response.json();
      setTrees(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTree = async (treeData: any) => {
    const response = await fetch(`${API_URL}/trees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create tree');
    }

    await fetchTrees();
    setShowForm(false);
  };

  const handleUpdateTree = async (treeData: any) => {
    if (!editingTree) return;

    const response = await fetch(`${API_URL}/trees/${editingTree.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update tree');
    }

    await fetchTrees();
    setEditingTree(null);
    setShowForm(false);
  };

  const handleDeleteTree = async (tree: Tree) => {
    try {
      const response = await fetch(`${API_URL}/trees/${tree.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tree');
      }

      await fetchTrees();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tree');
    }
  };

  const handleEdit = (tree: Tree) => {
    setEditingTree(tree);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTree(null);
  };

  const handleNewTree = () => {
    setEditingTree(null);
    setShowForm(true);
  };

  const storeLocations = Array.from(new Set(trees.map(tree => tree.storeLocation)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Christmas Tree Inventory</h1>
          <p className="text-gray-600 mt-2">Manage your Christmas tree inventory across all store locations</p>
        </div>
        {!showForm && (
          <Button onClick={handleNewTree} variant="success">
            + Add New Tree
          </Button>
        )}
      </div>

      {/* Global Error */}
      {error && <ErrorMessage message={error} onRetry={fetchTrees} />}

      {/* Form Section */}
      {showForm && (
        <div className="animate-fade-in">
          <Card className="transition-all duration-300 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTree ? 'Edit Tree' : 'Add New Tree'}
            </h2>
            <TreeForm
              tree={editingTree}
              onSubmit={editingTree ? handleUpdateTree : handleCreateTree}
              onCancel={handleCancelForm}
            />
          </Card>
        </div>
      )}

      {/* Tree List */}
      <TreeList
        trees={trees}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteTree}
        storeLocations={storeLocations}
      />
    </div>
  );
}
