import React, { useState, useEffect } from 'react';
import './SortNotification.css';

interface SortNotificationProps {
  message: string;
  notificationKey: number; // 'show' propから変更
}

export const SortNotification: React.FC<SortNotificationProps> = ({ message, notificationKey }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // notificationKeyが0より大きい場合（＝最初の表示ではない場合）に実行
    if (notificationKey > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // 2秒後にアニメーションで非表示にする

      return () => clearTimeout(timer);
    }
  }, [notificationKey]); // 依存配列をnotificationKeyに変更

  // キーが0の場合は何もレンダリングしない
  if (notificationKey === 0) {
    return null;
  }

  return (
    <div className={`sort-notification ${isVisible ? 'show' : ''}`}>
      {message}
    </div>
  );
};