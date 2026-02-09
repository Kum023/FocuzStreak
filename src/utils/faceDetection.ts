declare const webgazer: any;

let isInitialized = false;
let activeAudio: HTMLAudioElement | null = null;
let faceNotDetectedAudio: HTMLAudioElement | null = null;
let lastDetectionTime = 0;
let lastFaceNotDetectedTime = 0;
const DETECTION_INTERVAL = 50;
const FACE_NOT_DETECTED_INTERVAL = 1000; // Beep every 1 second when face not detected

// Calibration data
let calibrationData: CalibrationData | null = null;
let isCalibrated = false;

// Smoothing and filtering
let gazeHistory: GazeData[] = [];
const HISTORY_LENGTH = 10;
let confidenceThreshold = 0.6;
let adaptiveThreshold = 0.8;

interface GazeData {
  x: number;
  y: number;
  confidence?: number;
}

interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CalibrationData {
  center: GazeData;
  left: GazeData;
  right: GazeData;
  top: GazeData;
  bottom: GazeData;
  screenBounds: {
    width: number;
    height: number;
  };
}

export const loadModel = async () => {
  if (isInitialized) return true;
  
  try {
    await webgazer
      .setRegression('ridge')
      .setTracker('TFFacemesh')
      .begin();
    
    webgazer.showVideo(true);
    webgazer.showFaceOverlay(true);
    webgazer.showFaceFeedbackBox(true);
    webgazer.showPredictionPoints(true);
    
    const style = document.createElement('style');
    style.textContent = `
      .webgazerGazeDot {
        background-color: #FF4B4B !important;
        border: 2px solid white !important;
        border-radius: 50% !important;
        opacity: 0.8 !important;
        pointer-events: none !important;
        transition: all 0.1s ease-out !important;
      }
      #webgazerVideoContainer {
        position: relative !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      #webgazerVideoCanvas {
        width: 100% !important;
        height: 100% !important;
      }
      video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
      .webgazer-face-overlay {
        border: 2px solid #4CAF50 !important;
        opacity: 0.7 !important;
      }
      .webgazerFaceFeedbackBox {
        border: 2px solid #2196F3 !important;
        opacity: 0.7 !important;
      }
      .webgazerFaceFeature {
        background-color: yellow !important;
        border-radius: 50% !important;
        opacity: 0.7 !important;
      }
    `;
    document.head.appendChild(style);
    
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing WebGazer:', error);
    return false;
  }
};

export const detectFace = async () => {
  if (!isInitialized) return null;
  
  const currentTime = Date.now();
  if (currentTime - lastDetectionTime < DETECTION_INTERVAL) {
    return null;
  }
  
  lastDetectionTime = currentTime;
  
  try {
    const prediction = await webgazer.getCurrentPrediction();
    if (!prediction) {
      // Face not detected - play beep sound
      playFaceNotDetectedSound();
      return { gazeData: null, faceDetected: false, timestamp: currentTime };
    }

    const faceFeatures = webgazer.getTracker().getPositions();
    const faceDetected = faceFeatures && faceFeatures.length > 0;
    const confidence = prediction.confidence || 0.5;
    const gazeData: GazeData = {
      x: prediction.x,
      y: prediction.y,
      confidence
    };

    if (!faceDetected) {
      playFaceNotDetectedSound();
    } else {
      stopFaceNotDetectedSound();
      gazeHistory.push(gazeData);
      if (gazeHistory.length > HISTORY_LENGTH) {
        gazeHistory.shift();
      }
    }

    return {
      gazeData,
      faceDetected,
      confidence,
      timestamp: currentTime
    };
  } catch (error) {
    console.error('Error getting face detection:', error);
    // Error occurred - play beep sound
    playFaceNotDetectedSound();
    return null;
  }
};

// Smooth gaze data using weighted average
const smoothGazeData = (gazeHistory: GazeData[]): GazeData => {
  if (gazeHistory.length === 0) return { x: 0, y: 0 };
  
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  let totalConfidence = 0;

  gazeHistory.forEach((gaze, index) => {
    const weight = index + 1; // More recent data has higher weight
    const confidence = gaze.confidence || 0.5;
    
    weightedX += gaze.x * weight * confidence;
    weightedY += gaze.y * weight * confidence;
    totalWeight += weight * confidence;
    totalConfidence += confidence;
  });

  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight,
    confidence: totalConfidence / gazeHistory.length
  };
};

// Calculate distance between two points
const calculateDistance = (point1: GazeData, point2: GazeData): number => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
};

// Check if gaze is within calibrated bounds
const isWithinCalibratedBounds = (gazeData: GazeData): boolean => {
  if (!calibrationData || !isCalibrated) {
    // Fallback to screen bounds if not calibrated
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    return gazeData.x >= 0 && gazeData.x <= windowWidth && 
           gazeData.y >= 0 && gazeData.y <= windowHeight;
  }

  // Use calibrated bounds with some tolerance
  const tolerance = 100; // pixels
  const bounds = calibrationData.screenBounds;
  
  return gazeData.x >= -tolerance && 
         gazeData.x <= bounds.width + tolerance && 
         gazeData.y >= -tolerance && 
         gazeData.y <= bounds.height + tolerance;
};

// Adaptive threshold based on user behavior
const updateAdaptiveThreshold = (confidence: number, isLookingAway: boolean) => {
  if (isLookingAway && confidence > adaptiveThreshold) {
    // If we think they're looking away but confidence is high, lower threshold
    adaptiveThreshold = Math.max(0.3, adaptiveThreshold - 0.05);
  } else if (!isLookingAway && confidence < adaptiveThreshold) {
    // If we think they're looking at screen but confidence is low, raise threshold
    adaptiveThreshold = Math.min(0.95, adaptiveThreshold + 0.02);
  }
};

export const isPupilLookingAway = (
  predictions: { gazeData: GazeData | null, faceDetected: boolean, confidence?: number } | null,
  sensitivity: number = 0.8
): boolean => {
  if (!predictions || !predictions.faceDetected || !predictions.gazeData) {
    return true;
  }

  // Smooth the gaze data
  const smoothedGaze = smoothGazeData(gazeHistory);
  
  // Check confidence threshold
  const confidence = predictions.confidence || 0.5;
  if (confidence < confidenceThreshold) {
    return true; // Low confidence means we can't trust the prediction
  }

  // Check if within calibrated bounds
  const withinBounds = isWithinCalibratedBounds(smoothedGaze);
  
  // Apply sensitivity adjustment
  const adjustedThreshold = adaptiveThreshold * sensitivity;
  const isLookingAway = !withinBounds || confidence < adjustedThreshold;
  
  // Update adaptive threshold
  updateAdaptiveThreshold(confidence, isLookingAway);

  // Handle audio alerts
  if (isLookingAway && !activeAudio) {
    playAlertSound();
  } else if (!isLookingAway && activeAudio) {
    stopAlertSound();
  }

  return isLookingAway;
};

// Calibration functions
export const startCalibration = () => {
  isCalibrated = false;
  calibrationData = null;
  gazeHistory = [];
};

export const addCalibrationPoint = (position: 'center' | 'left' | 'right' | 'top' | 'bottom') => {
  if (!calibrationData) {
    calibrationData = {
      center: { x: 0, y: 0 },
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
      top: { x: 0, y: 0 },
      bottom: { x: 0, y: 0 },
      screenBounds: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  // Get current gaze data
  const currentGaze = gazeHistory[gazeHistory.length - 1];
  if (currentGaze) {
    calibrationData[position] = { ...currentGaze };
  }
};

export const completeCalibration = () => {
  if (calibrationData) {
    isCalibrated = true;
    console.log('Calibration completed:', calibrationData);
  }
};

export const getCalibrationStatus = () => {
  return { isCalibrated, calibrationData };
};

export const setConfidenceThreshold = (threshold: number) => {
  confidenceThreshold = Math.max(0.1, Math.min(0.9, threshold));
};

export const playAlertSound = () => {
  if (activeAudio) return;
  
  const audio = new Audio('/src/assets/alarm-327234.mp3');
  audio.loop = true;
  audio.volume = 0.5;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.error('Error playing alert sound:', error);
    });
  }
  
  activeAudio = audio;
};

export const stopAlertSound = () => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
};

export const playFaceNotDetectedSound = () => {
  const currentTime = Date.now();
  if (currentTime - lastFaceNotDetectedTime < FACE_NOT_DETECTED_INTERVAL) {
    return; // Don't beep too frequently
  }
  
  lastFaceNotDetectedTime = currentTime;
  
  if (faceNotDetectedAudio) {
    faceNotDetectedAudio.currentTime = 0;
    faceNotDetectedAudio.play().catch(error => {
      console.error('Error playing face not detected sound:', error);
    });
  } else {
    // Create new audio element for face not detected sound
    const audio = new Audio('/src/assets/alarm-327234.mp3');
    audio.volume = 0.3; // Lower volume for face not detected
    audio.play().catch(error => {
      console.error('Error playing face not detected sound:', error);
    });
    faceNotDetectedAudio = audio;
  }
};

export const stopFaceNotDetectedSound = () => {
  if (faceNotDetectedAudio) {
    faceNotDetectedAudio.pause();
    faceNotDetectedAudio.currentTime = 0;
    faceNotDetectedAudio = null;
  }
};

export const cleanup = () => {
  if (isInitialized) {
    webgazer.end();
    isInitialized = false;
  }
  stopAlertSound();
  stopFaceNotDetectedSound();
  gazeHistory = [];
  isCalibrated = false;
  calibrationData = null;
};