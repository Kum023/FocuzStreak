import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { detectFace, isPupilLookingAway, stopAlertSound, stopFaceNotDetectedSound, cleanup, loadModel, attachWebGazerVideoTo, setDetectionVideo, unlockAlertSound, isUsingMediaPipe } from '../utils/faceDetection';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const FaceMonitor = () => {
  const [lookingAway, setLookingAway] = useState(false);
  const [gazePoint, setGazePoint] = useState<{ x: number; y: number } | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const animationFrameRef = useRef<number>();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const location = useLocation();
  
  const { 
    isModelLoaded, 
    isMonitoring, 
    setIsMonitoring,
    setIsFacingAway,
    maintainFocusState,
    sensitivity
  } = useAppContext();

  const isMonitorPage = location.pathname === '/';

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!isMonitorPage) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        const attachStreamToVideo = () => {
          if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
            setDetectionVideo(videoRef.current);
          }
        };
        attachStreamToVideo();
        await loadModel();
        if (!mounted) return;
        attachWebGazerVideoTo(videoContainerRef.current);
        attachStreamToVideo();
        requestAnimationFrame(() => {
          if (mounted) {
            attachStreamToVideo();
            setVideoReady(true);
          }
        });
      } catch (e) {
        console.error('Camera / model init:', e);
      }
    };

    init();

    return () => {
      mounted = false;
      setVideoReady(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setDetectionVideo(null);
      cleanup();
    };
  }, [isMonitorPage]);

  useEffect(() => {
    const runDetection = async () => {
      if (!isModelLoaded || !isMonitoring) {
        animationFrameRef.current = requestAnimationFrame(runDetection);
        return;
      }
      
      const predictions = await detectFace();

      if (predictions) {
        if (predictions.gazeData && predictions.gazeIsEyeTracking) {
          setGazePoint({ x: predictions.gazeData.x, y: predictions.gazeData.y });
        } else {
          setGazePoint(null);
        }
        const isAway = isPupilLookingAway(predictions, sensitivity);
        setLookingAway(isAway);
        setIsFacingAway(isAway);
      }

      animationFrameRef.current = requestAnimationFrame(runDetection);
    };
    
    if (isMonitoring && (isMonitorPage || maintainFocusState)) {
      runDetection();
    } else {
      stopAlertSound();
      stopFaceNotDetectedSound();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopAlertSound();
      stopFaceNotDetectedSound();
    };
  }, [isModelLoaded, isMonitoring, isMonitorPage, maintainFocusState, setIsFacingAway]);
  
  const toggleMonitoring = () => {
    unlockAlertSound();
    setIsMonitoring(!isMonitoring);
    if (lookingAway) {
      setLookingAway(false);
      setIsFacingAway(false);
    }
    stopAlertSound();
    stopFaceNotDetectedSound();
  };

  if (!isMonitorPage) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div ref={videoContainerRef} className="relative min-h-[300px] w-full bg-gray-900 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${(isUsingMediaPipe() && videoReady) ? '' : 'hidden'}`}
        />
        {!isModelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center p-8 text-white">
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Initializing eye tracking...</p>
            </div>
          </div>
        )}

        {isMonitoring && gazePoint && (
          <div
            className="fixed w-4 h-4 rounded-full bg-red-500 border-2 border-white pointer-events-none z-[10000]"
            style={{ left: gazePoint.x - 8, top: gazePoint.y - 8 }}
          />
        )}
        {isMonitoring && lookingAway && (
          <div className="absolute top-4 left-4 right-4 bg-red-100 text-red-800 p-3 rounded-md flex items-center space-x-2 animate-pulse z-10">
            <AlertTriangle className="w-5 h-5" />
            <span>Please look back at the screen!</span>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Focus Monitor</h2>
            <p className="text-sm text-gray-600">
              {!isModelLoaded 
                ? 'Loading eye tracking...'
                : 'Eye tracking ready'}
            </p>
            {isModelLoaded && (
              <p className="text-xs text-gray-500 mt-0.5">Tip: Click around the page while looking at the cursor to improve accuracy.</p>
            )}
          </div>
          
          <button
            onClick={toggleMonitoring}
            disabled={!isModelLoaded}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              !isModelLoaded 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isMonitoring
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            {isMonitoring ? (
              <>
                <EyeOff className="w-5 h-5" />
                <span>Stop Monitoring</span>
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                <span>Start Monitoring</span>
              </>
            )}
          </button>
        </div>
        
        {isMonitoring && (
          <div className={`mt-4 p-3 rounded-md ${
            lookingAway
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            <p className="font-medium">
              {lookingAway
                ? 'You are looking away from the screen!' 
                : 'You are looking at the screen.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceMonitor;