import React from 'react';
import './Header.css';
import type { AuthState } from '../types/auth';
import logo from '../assets/logo.png'; // ロゴをインポート

interface HeaderProps {
  authState: AuthState;
}

export const Header: React.FC<HeaderProps> = ({ authState }) => {
  const scrollToLoginPrompt = () => {
    const element = document.getElementById('login-prompt');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      {authState.isInitialized && !authState.isLoggedIn && (
        <div className="friend-prompt">
          <div className="prompt-inner">
            <p>
              LINE公式アカウントを友だち追加＆ログインで、すべての企業情報にフルアクセス！
            </p>
            <button onClick={scrollToLoginPrompt} className="scroll-to-bottom-button">
              詳細を見る
            </button>
          </div>
        </div>
      )}
      <div className="header-inner">
        <div className="header-brand">
          <img src={logo} alt="ジモトデ就活" className="brand-logo" />
        </div>
      </div>
    </header>
  );
};