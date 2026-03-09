import React, { useRef, useEffect, useState } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { playAlertSound } from '../utils/faceDetection';

const IRIS_LEFT = 468;
const IRIS_RIGHT = 473;
const EYE_LEFT_LEFT = 33;
const EYE_LEFT_RIGHT = 133;
const EYE_RIGHT_LEFT = 362;
const EYE_RIGHT_RIGHT = 263;
const GAZE_CENTER_MIN = 0.35;
const GAZE_CENTER_MAX = 0.65;
const LOOKING_AWAY_ALERT_MS = 10000;

const FaceMeshOverlay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const rafRef = useRef<number>(0);
  const lookingAwayStartTimeRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        video.srcObject = stream;
        await video.play();

        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detector = await faceLandmarksDetection.createDetector(model, {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
          refineLandmarks: true,
        });
        if (!mounted) {
          detector.dispose();
          return;
        }
        detectorRef.current = detector;

        const draw = async () => {
          if (!mounted || !detectorRef.current || !videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video.readyState < 2) {
            rafRef.current = requestAnimationFrame(draw);
            return;
          }
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            rafRef.current = requestAnimationFrame(draw);
            return;
          }
          const faces = await detectorRef.current.estimateFaces(video);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          let bothEyesLookingAway = false;
          if (faces.length > 0) {
            const face = faces[0];
            const kp = face.keypoints ?? [];
            if (kp.length > 473) {
              const irisL = kp[IRIS_LEFT];
              const irisR = kp[IRIS_RIGHT];
              const leftL = kp[EYE_LEFT_LEFT];
              const leftR = kp[EYE_LEFT_RIGHT];
              const rightL = kp[EYE_RIGHT_LEFT];
              const rightR = kp[EYE_RIGHT_RIGHT];
              const dxLeft = leftR.x - leftL.x;
              const dxRight = rightR.x - rightL.x;
              const ratioLeft = dxLeft !== 0 ? (irisL.x - leftL.x) / dxLeft : 0.5;
              const ratioRight = dxRight !== 0 ? (irisR.x - rightL.x) / dxRight : 0.5;
              const leftCentered = ratioLeft >= GAZE_CENTER_MIN && ratioLeft <= GAZE_CENTER_MAX;
              const rightCentered = ratioRight >= GAZE_CENTER_MIN && ratioRight <= GAZE_CENTER_MAX;
              bothEyesLookingAway = !leftCentered && !rightCentered;
            }
          }

          if (bothEyesLookingAway) {
            const now = Date.now();
            if (lookingAwayStartTimeRef.current === null) {
              lookingAwayStartTimeRef.current = now;
            } else if (now - lookingAwayStartTimeRef.current >= LOOKING_AWAY_ALERT_MS) {
              playAlertSound();
              lookingAwayStartTimeRef.current = now;
            }
          } else {
            lookingAwayStartTimeRef.current = null;
          }

          if (faces.length > 0) {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
          }
          for (const face of faces) {
            const keypoints = face.keypoints ?? [];
            ctx.fillStyle = '#00FFFF';
            ctx.globalAlpha = 0.7;
            for (const k of keypoints) {
              ctx.beginPath();
              ctx.arc(k.x, k.y, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.globalAlpha = 1;
          }
          rafRef.current = requestAnimationFrame(draw);
        };
        draw();
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to start webcam');
      }
    };

    run();
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-lg bg-gray-900">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover invisible"
        style={{ visibility: 'hidden' }}
      />
      <canvas
        ref={canvasRef}
        className="relative block w-full h-auto"
        style={{ display: 'block', maxWidth: '100%' }}
      />
    </div>
  );
};

export default FaceMeshOverlay;
