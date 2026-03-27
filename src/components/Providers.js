"use client";

import { AppProvider } from '@/hooks/useAppContext';
import { HabitsProvider } from '@/hooks/useHabits';
import { PetProvider } from '@/hooks/useGamification';
import { LearningProvider } from '@/hooks/useLearningPlan';
import { RewardsProvider } from '@/hooks/useRewards';
import EvolutionModal from '@/components/Pet/EvolutionModal';
import { useEffect } from 'react';

export default function Providers({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <AppProvider>
      <LearningProvider>
        <HabitsProvider>
          <RewardsProvider>
          <PetProvider>
            <EvolutionModal />
            {children}
          </PetProvider>
          </RewardsProvider>
        </HabitsProvider>
      </LearningProvider>
    </AppProvider>
  );
}
