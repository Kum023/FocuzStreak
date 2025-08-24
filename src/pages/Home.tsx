import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import FaceMonitor from '../components/FaceMonitor';

const Home = () => {
  const { isModelLoaded } = useAppContext();
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img 
            src="/src/assets/focuslog.png"
            alt="FocuzStreak"
            className="w-24 h-24"
          />
        </div>
        <h1 className="text-2xl font-bold text-black mb-4 font-['Press_Start_2P']">FocuzStreak</h1>
        <p className="text-gray-600 max-w-2xl mx-auto font-['Press_Start_2P'] text-[10px] leading-relaxed">
          Monitor your attention and get alerted when you look away from the screen.
          Perfect for studying, work, or whenever focus is essential.
        </p>
      </div>
      
      {!isModelLoaded && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 font-['Press_Start_2P'] text-[10px]">Loading AI Model</p>
              <p className="text-amber-700 text-[10px] font-['Press_Start_2P'] mt-2 leading-relaxed">
                Please wait while we load the face detection model.
                This may take a few moments depending on your connection speed.
              </p>
            </div>
          </div>
        </div>
      )}

      <FaceMonitor />
      
      <div className="mt-8 bg-[#fffaee] rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-black mb-6 font-['Press_Start_2P']">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg border-2 border-[#ffb5e6]">
            <div className="w-12 h-12 bg-[#ffb5e6] rounded-full flex items-center justify-center text-white font-bold mb-4">1</div>
            <h3 className="font-medium text-black mb-3 font-['Press_Start_2P'] text-[10px]">Enable Camera</h3>
            <p className="text-[#faaa42] text-[10px] font-['Press_Start_2P'] leading-relaxed">
              Grant camera permissions so FocuzStreak can monitor your eye movement.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-[#ff8a8a]">
            <div className="w-12 h-12 bg-[#ff8a8a] rounded-full flex items-center justify-center text-white font-bold mb-4">2</div>
            <h3 className="font-medium text-black mb-3 font-['Press_Start_2P'] text-[10px]">Start Monitor</h3>
            <p className="text-[#faaa42] text-[10px] font-['Press_Start_2P'] leading-relaxed">
              Click the "Start Monitoring" button to begin tracking your gaze.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-[#f85b27]">
            <div className="w-12 h-12 bg-[#f85b27] rounded-full flex items-center justify-center text-white font-bold mb-4">3</div>
            <h3 className="font-medium text-black mb-3 font-['Press_Start_2P'] text-[10px]">Get Alerts</h3>
            <p className="text-[#faaa42] text-[10px] font-['Press_Start_2P'] leading-relaxed">
              Receive visual and audio alerts when you look away from screen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;