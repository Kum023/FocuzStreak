import React from 'react';
import FocusStats from '../components/FocusStats';
import { Clock, Calendar, BarChart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const { focusStats, isMonitoring } = useAppContext();
  
  // Calculate some additional metrics
  const focusPercentage = focusStats.totalTime > 0
    ? Math.round((focusStats.focusedTime / focusStats.totalTime) * 100)
    : 0;
  
  const distractionCount = Math.floor(focusStats.distractedTime / 5);
  
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Focus Dashboard</h1>
        <div className="flex items-center mt-2 md:mt-0 text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{getCurrentDate()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <p className="text-lg font-semibold text-gray-900">
              {isMonitoring 
                ? focusPercentage >= 70 
                  ? 'Highly Focused' 
                  : focusPercentage >= 40 
                    ? 'Moderately Focused' 
                    : 'Easily Distracted'
                : 'Not Monitoring'}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
            <BarChart className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Focus Score</p>
            <p className="text-lg font-semibold text-gray-900">
              {focusPercentage}%
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Distraction Events</p>
            <p className="text-lg font-semibold text-gray-900">
              {distractionCount}
            </p>
          </div>
        </div>
      </div>
      
      <FocusStats />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Focus Tips</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm mr-3 mt-0.5">
              1
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Take regular breaks</span> - Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.
            </p>
          </li>
          <li className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-sm mr-3 mt-0.5">
              2
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Minimize distractions</span> - Turn off notifications and create a dedicated workspace.
            </p>
          </li>
          <li className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm mr-3 mt-0.5">
              3
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Stay hydrated</span> - Dehydration can reduce concentration and cognitive performance.
            </p>
          </li>
          <li className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm mr-3 mt-0.5">
              4
            </div>
            <p className="text-gray-700">
              <span className="font-medium">Use the Pomodoro technique</span> - Work in focused 25-minute intervals with short breaks.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

// Make sure to import AlertTriangle
import { AlertTriangle } from 'lucide-react';

export default Dashboard;