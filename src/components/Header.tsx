import React from 'react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="brand-mark">🎓</span>
          <div className="brand-text">
            <span className="brand-title">ジモトデ</span>
            <span className="brand-subtitle">広島の就活パートナー</span>
          </div>
        </div>
      </div>
    </header>
  );
};
