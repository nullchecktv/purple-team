'use client';

import { useState, useEffect } from 'react';
import { validateLocation, fetchDeliveryZones, DeliveryZoneData } from '@/utils/locationValidation';

interface LocationStepProps {
  onNext: (data: { city: string; zipCode: string; deliveryZone: string }) => void;
  initialValue?: { city: string; zipCode: string; deliveryZone: string };
}

export default function LocationStep({ onNext, initialValue }: LocationStepProps) {
  const [location, setLocation] = useState(initialValue?.city || initialValue?.zipCode || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [zoneData, setZoneData] = useState<DeliveryZoneData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDeliveryZones().then(setZoneData).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await validateLocation(location);
      
      if (result.valid && result.deliveryZone) {
        const isZipCode = /^\d{5}$/.test(location);
        onNext({
          city: isZipCode ? '' : location,
          zipCode: isZipCode ? location : '',
          deliveryZone: result.deliveryZone
        });
      } else {
        setError(result.error || 'Invalid location');
      }
    } catch (err) {
      setError('Failed to validate location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 animate-fade-in">
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 p-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📍</div>
          <h2 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">Where are you located?</h2>
          <p className="text-lg text-gray-500">Enter your Texas city or zip code to see available trees</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Dallas or 75201"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white/50 backdrop-blur"
              required
            />
            {error && (
              <p className="mt-3 text-sm text-red-500 animate-shake">{error}</p>
            )}
          </div>

          {mounted && zoneData && (
            <div className="bg-gradient-to-br from-green-50 to-red-50 rounded-2xl p-6 border border-green-200/50">
              <p className="text-sm font-semibold text-gray-700 mb-3">✨ Available Delivery Zones</p>
              <div className="grid grid-cols-2 gap-3">
                {zoneData.zones.map(zone => (
                  <div key={zone} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {zone}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !location.trim()}
            className="w-full bg-gradient-to-r from-green-600 to-red-600 text-white py-4 px-8 rounded-2xl font-semibold hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Validating...
              </span>
            ) : (
              'Continue →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
