'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FilterCriteria } from '@/types/tree';
import LocationStep from '@/components/wizard/LocationStep';
import PriceRangeStep from '@/components/wizard/PriceRangeStep';
import QualityStep from '@/components/wizard/QualityStep';
import DeliveryStep from '@/components/wizard/DeliveryStep';
import ReturnPolicyStep from '@/components/wizard/ReturnPolicyStep';
import SocialPopularityStep from '@/components/wizard/SocialPopularityStep';
import ResultsDisplay from '@/components/wizard/ResultsDisplay';
import TreeDetailModal from '@/components/wizard/TreeDetailModal';

type WizardStep = 'location' | 'price' | 'quality' | 'delivery' | 'return' | 'social' | 'results';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('location');
  const [criteria, setCriteria] = useState<Partial<FilterCriteria>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  const updateCriteria = (updates: Partial<FilterCriteria>) => {
    setCriteria(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    const steps: WizardStep[] = ['location', 'price', 'quality', 'delivery', 'return', 'social', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const steps: WizardStep[] = ['location', 'price', 'quality', 'delivery', 'return', 'social', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const startOver = () => {
    setCriteria({});
    setCurrentStep('location');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wizard-state');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 relative overflow-hidden">
      {/* Festive background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">❄️</div>
        <div className="absolute top-40 right-20 text-5xl opacity-10 animate-float-delayed">🎄</div>
        <div className="absolute bottom-20 left-1/4 text-4xl opacity-10 animate-float">⭐</div>
        <div className="absolute top-1/3 right-1/3 text-5xl opacity-10 animate-float-delayed">🎁</div>
      </div>
      <Header />
      
      <main>
        {currentStep === 'location' && (
          <LocationStep
            onNext={(location) => {
              updateCriteria({ location });
              nextStep();
            }}
            initialValue={criteria.location}
          />
        )}

        {currentStep === 'price' && (
          <PriceRangeStep
            onNext={(priceRange) => {
              updateCriteria({ priceRange });
              nextStep();
            }}
            onBack={previousStep}
            initialValue={criteria.priceRange}
          />
        )}

        {currentStep === 'quality' && (
          <QualityStep
            onNext={(minQuality) => {
              updateCriteria({ minQuality });
              nextStep();
            }}
            onBack={previousStep}
            initialValue={criteria.minQuality}
          />
        )}

        {currentStep === 'delivery' && (
          <DeliveryStep
            onNext={(delivery) => {
              updateCriteria({ delivery });
              nextStep();
            }}
            onBack={previousStep}
            initialValue={criteria.delivery}
          />
        )}

        {currentStep === 'return' && (
          <ReturnPolicyStep
            onNext={(minReturnDays) => {
              updateCriteria({ minReturnDays });
              nextStep();
            }}
            onBack={previousStep}
            initialValue={criteria.minReturnDays}
          />
        )}

        {currentStep === 'social' && (
          <SocialPopularityStep
            onNext={(popularityLevel) => {
              updateCriteria({ popularityLevel });
              nextStep();
            }}
            onBack={previousStep}
            initialValue={criteria.popularityLevel}
          />
        )}

        {currentStep === 'results' && criteria.location && criteria.priceRange && (
          <ResultsDisplay
            criteria={criteria as FilterCriteria}
            onStartOver={startOver}
            onSelectTree={setSelectedTreeId}
          />
        )}

        {selectedTreeId && (
          <TreeDetailModal
            treeId={selectedTreeId}
            onClose={() => setSelectedTreeId(null)}
          />
        )}
      </main>
    </div>
  );
}
