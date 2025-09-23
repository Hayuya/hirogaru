import React from 'react';
import type { LiffUser } from '../types/auth';
import './Header.css';

interface HeaderProps {
  user?: LiffUser | null;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, isLoggedIn }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-logo">ジモトデ</h1>
          <nav className="header-nav">
            <a href="#" className="nav-link active">{/* 任意のナビゲーション */}</a>
          </nav>
        </div>
        <div className="header-right">
          {/* ▼▼▼ ここから変更 ▼▼▼ */}
          <div className="login-status">
            {isLoggedIn && user ? (
              <>
                <span>ログイン中 ID:</span>
                <span className="user-id">{user.userId}</span>
              </>
            ) : (
              <span>未ログイン</span>
            )}
          </div>
          {/* ▲▲▲ ここまで変更 ▲▲▲ */}
        </div>
      </div>
    </header>
  );
};
