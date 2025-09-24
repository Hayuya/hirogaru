import React from 'react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-inner">
        <nav className="header-nav">
          <a href="#features" className="nav-link">特徴</a>
          <a href="#companies" className="nav-link">企業一覧</a>
          <a href="#support" className="nav-link">サポート</a>
        </nav>

        <div className="header-brand">
          <span className="brand-mark">J</span>
          <div className="brand-text">
            <span className="brand-title">ジモトデ</span>
            <span className="brand-subtitle">広島の就活パートナー</span>
          </div>
        </div>

        <a href="#contact" className="header-cta">個別相談</a>
      </div>
    </header>
  );
};
