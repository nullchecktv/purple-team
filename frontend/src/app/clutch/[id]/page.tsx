'use client';

import ClutchResultsPage from '@/components/ClutchResultsPage';
import { useParams } from 'next/navigation';

export default function ClutchPage() {
  const params = useParams();
  const clutchId = params.id as string;

  if (!clutchId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid clutch ID</p>
      </div>
    );
  }

  return <ClutchResultsPage clutchId={clutchId} />;
}
