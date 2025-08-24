import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadModel } from '../utils/faceDetection';

interface AppContextType {
  isModelLoaded: boolean;
  isMonitoring: boolean;
  setIsMonitoring: (value: boolean) => void;
  sensitivity: number;
  setSensitivity: (value: number) => void;
  alertTimeout: number;
  setAlertTimeout: (value: number) => void;
  isFacingAway: boolean;
  setIsFacingAway: (value: boolean) => void;
  focusStats: {
    totalTime: number;
    focusedTime: number;
    distractedTime: number;
    points: number;
  };
  resetStats: () => void;
  equippedHat: string | null;
  equipHat: (hatImage: string) => void;
  deductPoints: (amount: number) => void;
  purchasedHats: string[];
  purchaseHat: (hatImage: string) => void;
  maintainFocusState: boolean;
  setMaintainFocusState: (value: boolean) => void;
}

const defaultContext: AppContextType = {
  isModelLoaded: false,
  isMonitoring: false,
  setIsMonitoring: () => {},
  sensitivity: 0.8,
  setSensitivity: () => {},
  alertTimeout: 2000,
  setAlertTimeout: () => {},
  isFacingAway: false,
  setIsFacingAway: () => {},
  focusStats: {
    totalTime: 0,
    focusedTime: 0,
    distractedTime: 0,
    points: 400
  },
  resetStats: () => {},
  equippedHat: null,
  equipHat: () => {},
  deductPoints: () => {},
  purchasedHats: [],
  purchaseHat: () => {},
  maintainFocusState: true,
  setMaintainFocusState: () => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.8);
  const [alertTimeout, setAlertTimeout] = useState(2000);
  const [isFacingAway, setIsFacingAway] = useState(false);
  const [equippedHat, setEquippedHat] = useState<string | null>(null);
  const [purchasedHats, setPurchasedHats] = useState<string[]>([]);
  const [maintainFocusState, setMaintainFocusState] = useState(true);
  const [focusStats, setFocusStats] = useState({
    totalTime: 0,
    focusedTime: 0,
    distractedTime: 0,
    points: 400
  });
  
  useEffect(() => {
    const initializeModel = async () => {
      try {
        await loadModel();
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Failed to load face detection model:', error);
      }
    };
    
    initializeModel();
  }, []);
  
  useEffect(() => {
    let interval: number | null = null;
    
    if (isMonitoring) {
      interval = window.setInterval(() => {
        setFocusStats(prev => {
          const newFocusedTime = isFacingAway ? prev.focusedTime : prev.focusedTime + 1;
          const newPoints = Math.floor(newFocusedTime / 60) * 10;
          
          return {
            ...prev,
            totalTime: prev.totalTime + 1,
            focusedTime: newFocusedTime,
            distractedTime: isFacingAway ? prev.distractedTime + 1 : prev.distractedTime,
            points: newPoints + 400
          };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isMonitoring, isFacingAway]);
  
  const resetStats = () => {
    setFocusStats({
      totalTime: 0,
      focusedTime: 0,
      distractedTime: 0,
      points: 400
    });
  };

  const equipHat = (hatImage: string) => {
    setEquippedHat(hatImage);
  };

  const deductPoints = (amount: number) => {
    setFocusStats(prev => ({
      ...prev,
      points: prev.points - amount
    }));
  };

  const purchaseHat = (hatImage: string) => {
    setPurchasedHats(prev => [...prev, hatImage]);
  };
  
  return (
    <AppContext.Provider
      value={{
        isModelLoaded,
        isMonitoring,
        setIsMonitoring,
        sensitivity,
        setSensitivity,
        alertTimeout,
        setAlertTimeout,
        isFacingAway,
        setIsFacingAway,
        focusStats,
        resetStats,
        equippedHat,
        equipHat,
        deductPoints,
        purchasedHats,
        purchaseHat,
        maintainFocusState,
        setMaintainFocusState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};