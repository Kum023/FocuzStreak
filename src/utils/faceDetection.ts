declare const webgazer: any;

import { initMediaPipe, isMediaPipeReady, detectFromVideo, disposeMediaPipe, getLastLandmarks } from './mediaPipeFace';

let isInitialized = false;
let useMediaPipe = false;
let detectionVideo: HTMLVideoElement | null = null;
let activeAudio: HTMLAudioElement | null = null;
let faceNotDetectedAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let beepUnlocked = false;
let beepLoopId: ReturnType<typeof setInterval> | null = null;
let lastDetectionTime = 0;
let lastFaceNotDetectedTime = 0;
const DETECTION_INTERVAL = 40;
const FACE_NOT_DETECTED_INTERVAL = 1000; // Beep every 1 second when face not detected

// Calibration data
let calibrationData: CalibrationData | null = null;
let isCalibrated = false;

// Smoothing and filtering
let gazeHistory: GazeData[] = [];
const HISTORY_LENGTH = 20;
// Consecutive frames before declaring look-away / look-back (reduces flicker)
const AWAY_FRAMES_THRESHOLD = 6;
const BACK_FRAMES_THRESHOLD = 3;
let consecutiveAwayFrames = 0;
let consecutiveBackFrames = 0;
// Pixels outside window edge to still count as "looking at screen" (forgiving)
const SCREEN_MARGIN = 150;
let confidenceThreshold = 0.4; // kept for setConfidenceThreshold API; not used for look-away

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

/** Set the video element used for detection (our camera feed). Call from FaceMonitor when stream is ready. */
export const setDetectionVideo = (video: HTMLVideoElement | null): void => {
  detectionVideo = video;
};

export const isUsingMediaPipe = (): boolean => useMediaPipe;

/** Latest face landmark coordinates and box. MediaPipe: 468 points, normalized x,y in [0,1]. */
export { getLastLandmarks, getWholeFacePoints, FACE_LANDMARK_COUNT } from './mediaPipeFace';

export const loadModel = async () => {
  if (isInitialized) return true;

  try {
    useMediaPipe = await initMediaPipe();
    if (useMediaPipe) {
      isInitialized = true;
      return true;
    }
  } catch {
    useMediaPipe = false;
  }

  try {
    if (typeof webgazer === 'undefined') return false;
    if (typeof webgazer.saveDataAcrossSessions === 'function') {
      webgazer.saveDataAcrossSessions(true);
    }
    if (typeof webgazer.applyKalmanFilter === 'function') {
      webgazer.applyKalmanFilter(true);
    }
    await webgazer
      .setRegression('ridge')
      .setTracker('TFFacemesh')
      .begin();

    if (typeof webgazer.addMouseEventListeners === 'function') {
      webgazer.addMouseEventListeners();
    }
    webgazer.showVideo(true);
    webgazer.showFaceOverlay(true);
    webgazer.showFaceFeedbackBox(true);
    webgazer.showPredictionPoints(true);
    if (typeof webgazer.setVideoViewerSize === 'function') {
      webgazer.setVideoViewerSize(640, 480);
    }

    const style = document.createElement('style');
    style.id = 'webgazer-focuzstreak-styles';
    style.textContent = `
      .webgazerGazeDot {
        background-color: #FF4B4B !important;
        border: 2px solid white !important;
        border-radius: 50% !important;
        opacity: 0.9 !important;
        pointer-events: none !important;
        transition: none !important;
        display: block !important;
        visibility: visible !important;
      }
      #webgazerVideoFeed, #webgazerVideoContainer {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 240px !important;
      }
      #webgazerVideoCanvas, #webgazerVideoFeed video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
      .webgazer-face-overlay { border: 2px solid #4CAF50 !important; opacity: 0.7 !important; }
      .webgazerFaceFeedbackBox { border: 2px solid #2196F3 !important; opacity: 0.7 !important; }
      .webgazerFaceFeature { background-color: yellow !important; border-radius: 50% !important; opacity: 0.7 !important; }
    `;
    if (!document.getElementById('webgazer-focuzstreak-styles')) {
      document.head.appendChild(style);
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Error initializing WebGazer:', error);
    return false;
  }
};

/** Call after loadModel() to move WebGazer video into your container. No-op when using MediaPipe. */
export const attachWebGazerVideoTo = (container: HTMLElement | null): void => {
  if (useMediaPipe || !container || !isInitialized) return;

  const tryAttach = (): boolean => {
    let target: HTMLElement | null =
      document.getElementById('webgazerVideoContainer') ||
      document.getElementById('webgazerVideoFeed');
    if (!target) {
      const canvas = document.getElementById('webgazerVideoCanvas') || document.getElementById('webgazerCanvas');
      target = canvas?.parentElement || canvas;
    }
    if (!target) {
      const byId = document.querySelector('[id*="webgazer"]');
      target = (byId as HTMLElement)?.querySelector('video')?.parentElement as HTMLElement || (byId as HTMLElement);
    }
    if (target) {
      target.setAttribute('style', [
        'position:absolute!important',
        'top:0!important',
        'left:0!important',
        'width:100%!important',
        'height:100%!important',
        'min-height:240px!important',
        'display:block!important',
        'visibility:visible!important',
        'opacity:1!important',
        'background:#1f2937!important',
        'z-index:5!important'
      ].join('; '));
      if (target.parentElement !== container) {
        container.appendChild(target);
      }
      const vid = target.querySelector('video');
      if (vid) {
        vid.style.cssText = 'width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;';
      }
      const canvas = target.querySelector('canvas');
      if (canvas) {
        canvas.style.cssText = 'width:100%!important;height:100%!important;object-fit:cover!important;pointer-events:none!important;';
      }
      return true;
    }
    return false;
  };

  tryAttach();
  [100, 300, 600, 1200].forEach((ms) => setTimeout(() => tryAttach(), ms));
};

/** Face landmark coordinates (normalized 0–1). MediaPipe gives 468 points. */
export type FaceLandmark = { x: number; y: number; z?: number };

export type DetectionResult = {
  gazeData: GazeData | null;
  faceDetected: boolean;
  confidence?: number;
  timestamp: number;
  lookingAtCamera?: boolean;
  /** True only when gazeData is from eye tracking (WebGazer). False when from face position (MediaPipe). */
  gazeIsEyeTracking?: boolean;
  /** Whole face points (468 landmarks when using MediaPipe). Normalized: x,y in [0,1], z relative depth. */
  faceLandmarks?: FaceLandmark[];
};

export const detectFace = async (): Promise<DetectionResult | null> => {
  if (!isInitialized) return null;

  const currentTime = Date.now();
  if (currentTime - lastDetectionTime < DETECTION_INTERVAL) {
    return null;
  }
  lastDetectionTime = currentTime;

  if (useMediaPipe && isMediaPipeReady() && detectionVideo) {
    const mp = detectFromVideo(detectionVideo);
    if (mp) {
      if (!mp.faceDetected) playFaceNotDetectedSound();
      else stopFaceNotDetectedSound();
      const gazeData: GazeData = {
        x: mp.gazeScreenX,
        y: mp.gazeScreenY,
        confidence: mp.confidence,
      };
      gazeHistory.push(gazeData);
      if (gazeHistory.length > HISTORY_LENGTH) gazeHistory.shift();
      const landmarkData = getLastLandmarks();
      return {
        gazeData,
        faceDetected: mp.faceDetected,
        confidence: mp.confidence,
        timestamp: currentTime,
        lookingAtCamera: mp.lookingAtCamera,
        gazeIsEyeTracking: false,
        faceLandmarks: landmarkData?.landmarks ?? undefined,
      };
    }
    return null;
  }

  if (!useMediaPipe) {
  try {
    const prediction = await webgazer.getCurrentPrediction();
    if (!prediction) {
      playFaceNotDetectedSound();
      return { gazeData: null, faceDetected: false, timestamp: currentTime };
    }

    const faceFeatures = webgazer.getTracker().getPositions();
    const faceDetected = faceFeatures && faceFeatures.length > 0;
    if (!faceDetected) playFaceNotDetectedSound();
    else stopFaceNotDetectedSound();

    const confidence = prediction.confidence || 0.5;
    const gazeData: GazeData = { x: prediction.x, y: prediction.y, confidence };
    gazeHistory.push(gazeData);
    if (gazeHistory.length > HISTORY_LENGTH) gazeHistory.shift();

    return {
      gazeData,
      faceDetected,
      confidence,
      timestamp: currentTime,
      gazeIsEyeTracking: true,
    };
  } catch (error) {
    console.error('Error getting face detection:', error);
    playFaceNotDetectedSound();
    return null;
  }
  }
  return null;
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

// Check if gaze is within screen (generous margin so we only trigger "away" when clearly off-screen)
const isGazeOnScreen = (gazeData: GazeData): boolean => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return (
    gazeData.x >= -SCREEN_MARGIN &&
    gazeData.x <= w + SCREEN_MARGIN &&
    gazeData.y >= -SCREEN_MARGIN &&
    gazeData.y <= h + SCREEN_MARGIN
  );
};

// When using MediaPipe we use lookingAtCamera. Otherwise use gaze bounds (WebGazer).
export const isPupilLookingAway = (
  predictions: DetectionResult | null,
  _sensitivity: number = 0.8
): boolean => {
  if (!predictions || !predictions.faceDetected || !predictions.gazeData) {
    consecutiveBackFrames = 0;
    consecutiveAwayFrames++;
    if (consecutiveAwayFrames >= AWAY_FRAMES_THRESHOLD) {
      if (!activeAudio) playAlertSound();
      return true;
    }
    return false;
  }

  let rawAway: boolean;
  if (typeof predictions.lookingAtCamera === 'boolean') {
    rawAway = !predictions.lookingAtCamera;
  } else {
    const smoothedGaze = smoothGazeData(gazeHistory);
    rawAway = !isGazeOnScreen(smoothedGaze);
  }

  if (rawAway) {
    consecutiveBackFrames = 0;
    consecutiveAwayFrames++;
    if (consecutiveAwayFrames >= AWAY_FRAMES_THRESHOLD) {
      if (!activeAudio) playAlertSound();
      return true;
    }
    return false;
  } else {
    consecutiveAwayFrames = 0;
    consecutiveBackFrames++;
    if (consecutiveBackFrames >= BACK_FRAMES_THRESHOLD && activeAudio) {
      stopAlertSound();
    }
    return false;
  }
};

function playBeepOnce(): void {
  try {
    let ctx = audioContext;
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    if (!audioContext) audioContext = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

function startBeepLoop(): void {
  playBeepOnce();
  beepLoopId = setInterval(playBeepOnce, 500);
}

// Calibration functions
export const startCalibration = () => {
  isCalibrated = false;
  calibrationData = null;
  gazeHistory = [];
  consecutiveAwayFrames = 0;
  consecutiveBackFrames = 0;
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

/** Call after a user gesture (e.g. Start Monitoring click) so the browser allows playing alert later. */
export const unlockAlertSound = (): void => {
  if (beepUnlocked) return;
  try {
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    audioContext = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.value = 0;
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.01);
    beepUnlocked = true;
  } catch (_) {}
};

export const playAlertSound = () => {
  if (activeAudio) return;
  activeAudio = {} as HTMLAudioElement;
  startBeepLoop();
};

export const stopAlertSound = () => {
  if (beepLoopId) {
    clearInterval(beepLoopId);
    beepLoopId = null;
  }
  activeAudio = null;
};

export const playFaceNotDetectedSound = () => {
  const currentTime = Date.now();
  if (currentTime - lastFaceNotDetectedTime < FACE_NOT_DETECTED_INTERVAL) return;
  lastFaceNotDetectedTime = currentTime;
  playBeepOnce();
};

export const stopFaceNotDetectedSound = () => {
  faceNotDetectedAudio = null;
};

export const cleanup = () => {
  if (useMediaPipe) {
    disposeMediaPipe();
    useMediaPipe = false;
  } else if (typeof webgazer !== 'undefined' && isInitialized) {
    webgazer.end();
  }
  isInitialized = false;
  detectionVideo = null;
  stopAlertSound();
  stopFaceNotDetectedSound();
  gazeHistory = [];
  isCalibrated = false;
  calibrationData = null;
  consecutiveAwayFrames = 0;
  consecutiveBackFrames = 0;
  beepLoopId = null;
};