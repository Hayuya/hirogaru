import React, { useState, useEffect } from 'react';
import './SortNotification.css';

interface SortNotificationProps {
  message: string;
  show: boolean;
}

export const SortNotification: React.FC<SortNotificationProps> = ({ message, show }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // 2秒後に非表示にする
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <div className={`sort-notification ${isVisible ? 'show' : ''}`}>
      {message}
    </div>
  );
};