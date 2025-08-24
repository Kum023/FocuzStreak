import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Volume2, Bell, Clock, Save, RotateCcw, Eye } from 'lucide-react';

const Settings = () => {
  const { 
    sensitivity, 
    setSensitivity, 
    alertTimeout, 
    setAlertTimeout,
    resetStats,
    maintainFocusState,
    setMaintainFocusState
  } = useAppContext();
  
  const [tempSettings, setTempSettings] = React.useState({
    sensitivity,
    alertTimeout
  });
  
  const [saved, setSaved] = React.useState(false);
  
  React.useEffect(() => {
    setTempSettings({
      sensitivity,
      alertTimeout
    });
  }, [sensitivity, alertTimeout]);
  
  const handleReset = () => {
    setTempSettings({
      sensitivity: 0.8,
      alertTimeout: 2000
    });
  };
  
  const handleSave = () => {
    setSensitivity(tempSettings.sensitivity);
    setAlertTimeout(tempSettings.alertTimeout);
    setSaved(true);
    
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Customize Gaze Guardian to match your preferences and needs.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-blue-700" />
          <span>Focus Monitor Settings</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Maintain Focus State</p>
              <p className="text-sm text-gray-600">Keep monitoring active when switching tabs</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={maintainFocusState}
                onChange={(e) => setMaintainFocusState(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Volume2 className="w-5 h-5 mr-2 text-blue-700" />
          <span>Sensitivity Settings</span>
        </h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="sensitivity" className="text-sm font-medium text-gray-700">
                Detection Sensitivity: {Math.round(tempSettings.sensitivity * 100)}%
              </label>
            </div>
            <input
              id="sensitivity"
              type="range"
              min="0.4"
              max="1"
              step="0.05"
              value={tempSettings.sensitivity}
              onChange={(e) => setTempSettings({
                ...tempSettings,
                sensitivity: parseFloat(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Less Sensitive</span>
              <span>More Sensitive</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between mb-2">
              <label htmlFor="timeout" className="flex items-center text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 mr-1 text-blue-700" />
                <span>Alert Delay: {tempSettings.alertTimeout / 1000} seconds</span>
              </label>
            </div>
            <input
              id="timeout"
              type="range"
              min="500"
              max="5000"
              step="500"
              value={tempSettings.alertTimeout}
              onChange={(e) => setTempSettings({
                ...tempSettings,
                alertTimeout: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Faster (0.5s)</span>
              <span>Slower (5s)</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Time to wait before triggering an alert when looking away from screen.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            <span>Reset to Default</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 rounded-md text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-1" />
            <span>Save Settings</span>
          </button>
        </div>
        
        {saved && (
          <div className="mt-4 p-2 bg-green-50 text-green-700 text-sm rounded-md text-center">
            Settings saved successfully!
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-700" />
          <span>Notification Settings</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Audio Alerts</p>
              <p className="text-sm text-gray-600">Play sound when you look away</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={true} className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Visual Alerts</p>
              <p className="text-sm text-gray-600">Show visual warning on screen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={true} className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Management</h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Clear all collected statistics and reset your focus data.
          </p>
          
          <button
            onClick={resetStats}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Reset Focus Statistics
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>
            Note: All data is stored locally in your browser. No information is sent to any server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;