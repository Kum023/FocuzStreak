import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const AnimatedLion = () => {
  const { isFacingAway, equippedHat } = useAppContext();
  const [showSadLion, setShowSadLion] = useState(false);
  const [distractionTimer, setDistractionTimer] = useState<NodeJS.Timeout | null>(null);
  const [focusTimer, setFocusTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFacingAway) {
      if (focusTimer) {
        clearTimeout(focusTimer);
        setFocusTimer(null);
      }
      
      if (!distractionTimer) {
        const timer = setTimeout(() => {
          setShowSadLion(true);
        }, 5000);
        setDistractionTimer(timer);
      }
    } else {
      if (distractionTimer) {
        clearTimeout(distractionTimer);
        setDistractionTimer(null);
      }
      
      if (showSadLion && !focusTimer) {
        const timer = setTimeout(() => {
          setShowSadLion(false);
        }, 5000);
        setFocusTimer(timer);
      }
    }

    return () => {
      if (distractionTimer) clearTimeout(distractionTimer);
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [isFacingAway, showSadLion]);

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className="relative">
        <img 
          src={showSadLion 
            ? "/src/assets/lion_sad_1_scaled_10x_minified (1).gif"
            : "/src/assets/lion_idle_scaled_10x_minified.gif"
          }
          alt="Animated Lion"
          className="w-48 h-48 object-contain"
        />
        {equippedHat && (
          <img
            src={equippedHat}
            alt="Lion Hat"
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 object-contain"
            style={{ 
              imageRendering: 'pixelated',
              transform: 'translate(-50%, -10%) scale(2)'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AnimatedLion;