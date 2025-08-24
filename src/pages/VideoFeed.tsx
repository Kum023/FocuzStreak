import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Camera, Maximize2, Minimize2, Eye, EyeOff, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { detectFace, isPupilLookingAway, playAlertSound, stopAlertSound, stopFaceNotDetectedSound } from '../utils/faceDetection';

const VideoFeed = () => {
  const { isModelLoaded, sensitivity } = useAppContext();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [calibrationPoints, setCalibrationPoints] = useState<{ x: number; y: number }[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (videoContainerRef.current) {
      const webgazerVideo = document.getElementById('webgazerVideoContainer');
      if (webgazerVideo) {
        webgazerVideo.style.cssText = `
          display: block !important;
          position: relative !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: ${isFullscreen ? '100%' : '300px'} !important;
          background: #000;
        `;
        videoContainerRef.current.appendChild(webgazerVideo);

        const videoElement = webgazerVideo.querySelector('video');
        if (videoElement) {
          videoElement.style.cssText = `
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          `;
        }

        const canvas = webgazerVideo.querySelector('canvas');
        if (canvas) {
          canvas.style.cssText = `
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          `;
        }
      }
    }
  }, [isModelLoaded, isFullscreen, isMonitoring]);

  useEffect(() => {
    const runDetection = async () => {
      if (!isModelLoaded || !isMonitoring) {
        animationFrameRef.current = requestAnimationFrame(runDetection);
        return;
      }

      const predictions = await detectFace();
      if (predictions) {
        const lookingAway = isPupilLookingAway(predictions, sensitivity);
        setIsLookingAway(lookingAway);
        
        if (lookingAway && isSoundEnabled) {
          playAlertSound();
        } else {
          stopAlertSound();
          stopFaceNotDetectedSound();
        }
        
        if (!lookingAway && predictions.gazeData) {
          setCalibrationPoints(prev => {
            const newPoint = {
              x: predictions.gazeData.x,
              y: predictions.gazeData.y
            };
            return [...prev.slice(-9), newPoint];
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(runDetection);
    };

    if (isMonitoring) {
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
  }, [isModelLoaded, isMonitoring, sensitivity, isSoundEnabled]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    setIsLookingAway(false);
    setCalibrationPoints([]);
    stopAlertSound();
    stopFaceNotDetectedSound();
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (!isSoundEnabled) {
      stopAlertSound();
      stopFaceNotDetectedSound();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Video Feed</h1>
      </div>

      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-800">Camera Preview</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-md transition-colors ${
                isSoundEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
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
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-gray-600" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div 
          className={`relative bg-gray-50 ${isFullscreen ? 'h-[calc(100vh-64px)]' : 'h-[300px]'}`} 
          ref={videoContainerRef}
        >
          {!isModelLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing camera...</p>
              </div>
            </div>
          )}
          {isMonitoring && isLookingAway && (
            <div className="absolute top-4 left-4 right-4 bg-red-100 text-red-800 p-3 rounded-md flex items-center space-x-2 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
              <span>Please look at the screen to maintain focus!</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            This video feed helps you ensure your face is properly positioned for accurate focus detection.
            {isFullscreen && (
              <span className="block mt-2">
                Press ESC or click the minimize button to exit fullscreen mode.
              </span>
            )}
          </p>
          {isMonitoring && (
            <>
              <div className={`mt-4 p-3 rounded-md ${
                isLookingAway ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                <p className="font-medium">
                  {isLookingAway
                    ? 'You are looking away from the screen!' 
                    : 'You are focused on the screen.'}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Calibration Points: {calibrationPoints.length} collected
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-orange-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(calibrationPoints.length / 10) * 100}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;