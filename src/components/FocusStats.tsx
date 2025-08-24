import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, Clock, RotateCcw, Award } from 'lucide-react';

const FocusStats = () => {
  const { focusStats, resetStats } = useAppContext();
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const focusPercentage = focusStats.totalTime > 0
    ? Math.round((focusStats.focusedTime / focusStats.totalTime) * 100)
    : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <PieChart className="w-6 h-6 text-orange-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Focus Statistics</h2>
        </div>
        <button
          onClick={resetStats}
          className="flex items-center space-x-1 text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-orange-700">Total Time</p>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-900 mt-2">{formatTime(focusStats.totalTime)}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-700">Focused Time</p>
            <Eye className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{formatTime(focusStats.focusedTime)}</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-red-700">Distracted Time</p>
            <EyeOff className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-900 mt-2">{formatTime(focusStats.distractedTime)}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-purple-700">Focus Points</p>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2">{focusStats.points}</p>
          <p className="text-xs text-purple-600 mt-1">+10 points per minute focused</p>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Focus Rate</span>
          <span className="text-sm font-medium text-gray-700">{focusPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-gradient-to-r from-orange-600 to-purple-600" 
            style={{ width: `${focusPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {focusStats.totalTime === 0 && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          No data yet. Start monitoring to collect focus statistics.
        </p>
      )}
    </div>
  );
};

import { Eye, EyeOff } from 'lucide-react';

export default FocusStats;