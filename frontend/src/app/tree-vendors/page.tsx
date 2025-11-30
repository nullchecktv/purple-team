'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamically import map component to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMzB4MkY2Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjM0I4MkY2Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const treeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMEY3NzJEIj48cGF0aCBkPSJNMTIgMkw4IDhsLTQgNmg0bC00IDZoMTZsLTQtNmg0bC00LTZsLTQtNnoiLz48cmVjdCB4PSIxMCIgeT0iMjAiIHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiM4QjQ1MTMiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Vendor {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  inventory: string;
  priceRange: string;
}

export default function TreeVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default location
        }
      );
    }

    // Fetch vendors
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-url.execute-api.us-east-1.amazonaws.com';
    fetch(`${apiUrl}/tree-vendors`)
      .then((res) => res.json())
      .then((data) => {
        setVendors(data.vendors || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Unable to load vendors. Please try again later.');
        setLoading(false);
      });

    setMapReady(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading Christmas tree vendors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-xl font-semibold mb-4">Error</div>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!vendors.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <p className="text-gray-700 text-lg">No vendors found in this area</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg p-6 z-10 relative">
        <h1 className="text-3xl font-bold text-white">🎄 Find Christmas Tree Vendors</h1>
        <p className="text-green-100 mt-2">Click on a tree pin to see vendor details</p>
      </div>
      
      {mapReady && (
        <div className="h-[calc(100vh-104px)] w-full">
          <MapContainer
            center={userLocation}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location marker */}
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-blue-600">Your Location</p>
                </div>
              </Popup>
            </Marker>

            {/* Vendor markers */}
            {vendors.map((vendor) => (
              <Marker
                key={vendor.id}
                position={[vendor.latitude, vendor.longitude]}
                icon={treeIcon}
              >
                <Popup>
                  <div className="space-y-3 min-w-[250px] p-2">
                    <h3 className="font-bold text-xl text-green-700 border-b-2 border-green-200 pb-2">
                      {vendor.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500">📍</span>
                        <p className="text-gray-700 flex-1">{vendor.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📞</span>
                        <p className="text-gray-700">{vendor.phone}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500">🌲</span>
                        <p className="text-gray-700 flex-1">{vendor.inventory}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">💰</span>
                        <p className="text-green-600 font-semibold">{vendor.priceRange}</p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
