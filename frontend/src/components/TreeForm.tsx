'use client';

import { useState, useEffect } from 'react';
import Button from './ui/Button';
import ErrorMessage from './ui/ErrorMessage';

interface TreeFormProps {
  tree?: any;
  onSubmit: (tree: any) => Promise<void>;
  onCancel?: () => void;
}

export default function TreeForm({ tree, onSubmit, onCancel }: TreeFormProps) {
  const [formData, setFormData] = useState({
    species: '',
    height: '',
    price: '',
    condition: 'Good',
    description: '',
    storeLocation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (tree) {
      setFormData({
        species: tree.species || '',
        height: tree.height?.toString() || '',
        price: tree.price?.toString() || '',
        condition: tree.condition || 'Good',
        description: tree.description || '',
        storeLocation: tree.storeLocation || ''
      });
    }
  }, [tree]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (!formData.species || !formData.height || !formData.price || !formData.storeLocation) {
      setError('Please fill in all required fields');
      return;
    }

    const height = parseFloat(formData.height);
    const price = parseFloat(formData.price);

    if (isNaN(height) || height <= 0) {
      setError('Height must be a positive number');
      return;
    }

    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        species: formData.species,
        height,
        price,
        condition: formData.condition,
        description: formData.description,
        storeLocation: formData.storeLocation
      });

      setSuccess(true);
      
      // Clear form if creating new tree
      if (!tree) {
        setFormData({
          species: '',
          height: '',
          price: '',
          condition: 'Good',
          description: '',
          storeLocation: ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save tree');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            {tree ? 'Tree updated successfully!' : 'Tree created successfully!'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
            Species <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="species"
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., Fraser Fir"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
            Height (feet) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="height"
            step="0.1"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., 7"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price ($) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="price"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., 89.99"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
            Condition
          </label>
          <select
            id="condition"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>

        <div>
          <label htmlFor="storeLocation" className="block text-sm font-medium text-gray-700 mb-2">
            Store Location <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="storeLocation"
            value={formData.storeLocation}
            onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., Downtown Store"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Detailed description of the tree..."
          disabled={loading}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" loading={loading} disabled={loading}>
          {tree ? 'Update Tree' : 'Create Tree'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
