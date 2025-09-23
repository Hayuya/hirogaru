import React from 'react';
import type { LiffUser } from '../types/auth';
import { authManager } from '../auth/authManager';
import './Header.css';

interface HeaderProps {
  user?: LiffUser | null;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, isLoggedIn }) => {
  const handleLogin = () => {
    authManager.login();
  };

  const handleLogout = () => {
    authManager.logout();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-logo">就職ポータルサイト「ヒロガル」</h1>
          <nav className="header-nav">
            <a href="#" className="nav-link active">{/* 任意のナビゲーション */}</a>
          </nav>
        </div>
        <div className="header-right">
          {isLoggedIn && user ? (
            <div className="user-menu">
              <div className="user-info">
                {user.pictureUrl && (
                  <img 
                    src={user.pictureUrl} 
                    alt={user.displayName} 
                    className="user-avatar"
                  />
                )}
                <span className="user-name">{user.displayName}</span>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                ログアウト
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={handleLogin}>
              LINEでログイン
            </button>
          )}
        </div>
      </div>
    </header>
  );
};