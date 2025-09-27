import React from 'react';
import './Header.css';
import type { AuthState } from '../types/auth';

interface HeaderProps {
  authState: AuthState;
}

export const Header: React.FC<HeaderProps> = ({ authState }) => {
  return (
    <header className="header">
      {authState.isInitialized && !authState.isLoggedIn && (
        <div className="friend-prompt">
          <div className="prompt-inner">
            <p>
              LINE公式アカウントを友だち追加して、すべての企業情報にフルアクセス！
            </p>
            <a href="https://line.me/R/ti/p/2008160073-gw4lNyDZ" className="add-friend-button" target="_blank" rel="noopener noreferrer">
              友だち追加する
            </a>
          </div>
        </div>
      )}
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