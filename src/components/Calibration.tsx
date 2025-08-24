import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface CalibrationProps {
  onComplete: (calibrationData: CalibrationData) => void;
  onCancel: () => void;
}

export interface CalibrationData {
  leftBound: number;
  rightBound: number;
  topBound: number;
  bottomBound: number;
}

const Calibration = ({ onComplete, onCancel }: CalibrationProps) => {
  const [step, setStep] = useState(0);
  const [calibrationData, setCalibrationData] = useState<Partial<CalibrationData>>({});
  const timeoutRef = useRef<number>();
  
  const steps = [
    { direction: 'center', icon: Check, text: 'Look at the center of the screen' },
    { direction: 'left', icon: ArrowLeft, text: 'Look at the left edge of your screen' },
    { direction: 'right', icon: ArrowRight, text: 'Look at the right edge of your screen' },
    { direction: 'up', icon: ArrowUp, text: 'Look at the top of your screen' },
    { direction: 'down', icon: ArrowDown, text: 'Look at the bottom of your screen' }
  ];

  useEffect(() => {
    if (step < steps.length) {
      timeoutRef.current = window.setTimeout(() => {
        setStep(prev => prev + 1);
      }, 3000);
    } else {
      onComplete(calibrationData as CalibrationData);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [step, calibrationData, onComplete]);

  const currentStep = steps[step];
  
  if (!currentStep) return null;

  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Calibrating Gaze Detection
        </h2>
        
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center
            ${step === 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
            <Icon className={`w-10 h-10 ${step === 0 ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          
          <p className="text-lg text-gray-700 text-center">
            {currentStep.text}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            Please keep your head still and only move your eyes
          </p>
        </div>
        
        <button
          onClick={onCancel}
          className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel Calibration
        </button>
      </div>
    </div>
  );
};

export default Calibration;
