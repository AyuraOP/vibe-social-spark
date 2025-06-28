
import React, { useState, useEffect } from 'react';
import { checkBackendHealth, API_BASE_URL } from '../utils/api';
import { Wifi, WifiOff } from 'lucide-react';

const BackendStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const healthy = await checkBackendHealth();
      setIsOnline(healthy);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline === null) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg text-sm ${
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isChecking ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isOnline ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span>
          {isChecking ? 'Checking...' : isOnline ? 'Backend Online' : 'Backend Offline'}
        </span>
        <div className="text-xs opacity-70">
          {API_BASE_URL.replace('http://', '').replace('https://', '')}
        </div>
      </div>
    </div>
  );
};

export default BackendStatus;
