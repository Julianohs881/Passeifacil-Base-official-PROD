
import { useState, useCallback, useRef } from 'react';
import { UserProfile } from '../types';

interface SubscriptionState {
  isVerifying: boolean;
  lastVerification: number;
  verificationCount: number;
}

export const useSubscriptionState = () => {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    isVerifying: false,
    lastVerification: 0,
    verificationCount: 0
  });
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const DEBOUNCE_DELAY = 1000; // 1 segundo
  const MIN_VERIFICATION_INTERVAL = 5000; // 5 segundos mínimo entre verificações

  const canVerify = useCallback(() => {
    const now = Date.now();
    const timeSinceLastVerification = now - subscriptionState.lastVerification;
    
    return !subscriptionState.isVerifying && 
           timeSinceLastVerification >= MIN_VERIFICATION_INTERVAL;
  }, [subscriptionState]);

  const startVerification = useCallback(() => {
    setSubscriptionState(prev => ({
      ...prev,
      isVerifying: true,
      lastVerification: Date.now(),
      verificationCount: prev.verificationCount + 1
    }));
  }, []);

  const endVerification = useCallback(() => {
    setSubscriptionState(prev => ({
      ...prev,
      isVerifying: false
    }));
  }, []);

  const debouncedAction = useCallback((action: () => Promise<void>) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (canVerify()) {
        startVerification();
        try {
          await action();
        } finally {
          endVerification();
        }
      }
    }, DEBOUNCE_DELAY);
  }, [canVerify, startVerification, endVerification]);

  const resetState = useCallback(() => {
    setSubscriptionState({
      isVerifying: false,
      lastVerification: 0,
      verificationCount: 0
    });
  }, []);

  return {
    subscriptionState,
    canVerify,
    startVerification,
    endVerification,
    debouncedAction,
    resetState
  };
};
