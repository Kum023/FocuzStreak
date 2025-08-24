import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { detectFace, isPupilLookingAway, stopAlertSound, stopFaceNotDetectedSound, cleanup, loadModel } from '../utils/faceDetection';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const FaceMonitor = () => {
  const [lookingAway, setLookingAway] = useState(false);
  const animationFrameRef = useRef<number>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const location = useLocation();
  
  const { 
    isModelLoaded, 
    isMonitoring, 
    setIsMonitoring,
    setIsFacingAway,
    maintainFocusState
  } = useAppContext();

  const isMonitorPage = location.pathname === '/';

  useEffect(() => {
    let mounted = true;

    const initializeCamera = async () => {
      if (!isMonitorPage) return;

      try {
        // Load the face detection model
        await loadModel();

        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Error initializing camera:', error);
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
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
        const isAway = isPupilLookingAway(predictions);
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
      <div className="relative min-h-[300px]">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {!isModelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing eye tracking...</p>
            </div>
          </div>
        )}
        
        {isMonitoring && lookingAway && (
          <div className="absolute top-4 left-4 right-4 bg-red-100 text-red-800 p-3 rounded-md flex items-center space-x-2 animate-pulse">
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