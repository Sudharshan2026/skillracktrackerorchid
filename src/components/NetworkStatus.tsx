import React, { useState, useEffect } from 'react';
import './NetworkStatus.css';

interface NetworkStatusProps {
  /** Callback when network status changes */
  onStatusChange?: (isOnline: boolean) => void;
}

/**
 * Network status indicator component
 * Shows connection status and provides retry functionality for network errors
 */
const NetworkStatus: React.FC<NetworkStatusProps> = ({ onStatusChange }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      onStatusChange?.(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      onStatusChange?.(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onStatusChange]);

  // Auto-hide offline message after coming back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineMessage]);

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
      <div className="network-status-content">
        <span className="network-status-icon">
          {isOnline ? '✅' : '🌐'}
        </span>
        <span className="network-status-message">
          {isOnline 
            ? 'Connection restored!' 
            : 'No internet connection. Please check your network and try again.'
          }
        </span>
        {!isOnline && (
          <button 
            className="network-retry-button"
            onClick={() => window.location.reload()}
            type="button"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;