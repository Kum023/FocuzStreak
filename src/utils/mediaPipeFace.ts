/**
 * MediaPipe Face Landmarker for reliable face detection and "looking at camera" estimation.
 * Uses 468 face landmarks (full face mesh); we derive face position and a simple frontal-facing score.
 */
/** Number of face landmark points (MediaPipe Face Mesh). */
export const FACE_LANDMARK_COUNT = 468;

import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const WASM_URL =
  typeof chrome !== 'undefined' && chrome.runtime?.id
    ? chrome.runtime.getURL('wasm/')
    : 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm';

let faceLandmarker: FaceLandmarker | null = null;
let lastVideoTime = -1;
let lastLandmarks: Array<{ x: number; y: number; z: number }> | null = null;
let lastBox: { x: number; y: number; width: number; height: number } | null = null;
let smoothedLandmarks: Array<{ x: number; y: number; z: number }> | null = null;
/** Blend factor for smoothing: 0 = no smoothing, 1 = raw only. 0.25 = stable, 0.5 = balanced. */
const SMOOTH_ALPHA = 0.35;

export interface MediaPipeResult {
  faceDetected: boolean;
  lookingAtCamera: boolean;
  /** Screen coordinates (face center mapped to viewport) for red-dot display */
  gazeScreenX: number;
  gazeScreenY: number;
  confidence: number;
}

// Key landmark indices (MediaPipe Face Mesh 468)
const NOSE_TIP = 4;
const LEFT_EYE_CENTER = 33;
const RIGHT_EYE_CENTER = 263;
const FOREHEAD = 10;

export async function initMediaPipe(): Promise<boolean> {
  if (faceLandmarker) return true;
  try {
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL },
      runningMode: 'video',
      numFaces: 1,
    });
    return true;
  } catch (e) {
    console.warn('MediaPipe Face Landmarker init failed:', e);
    return false;
  }
}

export function isMediaPipeReady(): boolean {
  return faceLandmarker != null;
}

/**
 * Run face detection on the current video frame.
 * lookingAtCamera: true when face is roughly frontal (center of face in middle 65% of frame).
 */
export function detectFromVideo(video: HTMLVideoElement): MediaPipeResult | null {
  if (!faceLandmarker || video.readyState < 2) return null;
  const now = performance.now();
  if (now - lastVideoTime < 33) return null; // ~30fps
  lastVideoTime = now;

  try {
    const result = faceLandmarker.detectForVideo(video, now);
    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      lastLandmarks = null;
      lastBox = null;
      smoothedLandmarks = null;
      return {
        faceDetected: false,
        lookingAtCamera: false,
        gazeScreenX: window.innerWidth / 2,
        gazeScreenY: window.innerHeight / 2,
        confidence: 0,
      };
    }

    const landmarks = result.faceLandmarks[0];
    if (landmarks.length < 300) return null;

    const raw = landmarks.map((l) => ({ x: l.x, y: l.y, z: l.z }));
    if (smoothedLandmarks && smoothedLandmarks.length === raw.length) {
      for (let i = 0; i < raw.length; i++) {
        smoothedLandmarks[i].x = SMOOTH_ALPHA * raw[i].x + (1 - SMOOTH_ALPHA) * smoothedLandmarks[i].x;
        smoothedLandmarks[i].y = SMOOTH_ALPHA * raw[i].y + (1 - SMOOTH_ALPHA) * smoothedLandmarks[i].y;
        smoothedLandmarks[i].z = SMOOTH_ALPHA * raw[i].z + (1 - SMOOTH_ALPHA) * smoothedLandmarks[i].z;
      }
      lastLandmarks = smoothedLandmarks;
    } else {
      smoothedLandmarks = raw.map((p) => ({ ...p }));
      lastLandmarks = smoothedLandmarks;
    }
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    for (const l of lastLandmarks) {
      minX = Math.min(minX, l.x); maxX = Math.max(maxX, l.x);
      minY = Math.min(minY, l.y); maxY = Math.max(maxY, l.y);
    }
    lastBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };

    const nose = lastLandmarks[NOSE_TIP];
    const leftEye = lastLandmarks[LEFT_EYE_CENTER];
    const rightEye = lastLandmarks[RIGHT_EYE_CENTER];
    if (!nose || !leftEye || !rightEye) return null;

    const faceCenterX = (nose.x + leftEye.x + rightEye.x) / 3;
    const faceCenterY = (nose.y + leftEye.y + rightEye.y) / 3;

    // Looking at camera when face is in the central 65% of the frame (frontal)
    const margin = 0.175;
    const lookingAtCamera =
      faceCenterX >= margin &&
      faceCenterX <= 1 - margin &&
      faceCenterY >= margin &&
      faceCenterY <= 1 - margin;

    // Map face center to screen coords for red-dot (viewport)
    const gazeScreenX = faceCenterX * window.innerWidth;
    const gazeScreenY = faceCenterY * window.innerHeight;

    return {
      faceDetected: true,
      lookingAtCamera,
      gazeScreenX,
      gazeScreenY,
      confidence: 1,
    };
  } catch {
    return null;
  }
}

/** Returns all 468 face points (normalized 0–1) and the face bounding box. */
export function getLastLandmarks(): {
  landmarks: Array<{ x: number; y: number; z: number }>;
  box: { x: number; y: number; width: number; height: number };
} | null {
  if (!lastLandmarks?.length || !lastBox) return null;
  return { landmarks: lastLandmarks, box: lastBox };
}

/** Returns the whole face points only (468 points). Same as getLastLandmarks()?.landmarks ?? []. */
export function getWholeFacePoints(): Array<{ x: number; y: number; z: number }> {
  return lastLandmarks ?? [];
}

export function disposeMediaPipe(): void {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
  }
  lastVideoTime = -1;
  lastLandmarks = null;
  lastBox = null;
  smoothedLandmarks = null;
}
