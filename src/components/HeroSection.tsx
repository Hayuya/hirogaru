import React from 'react';
import './HeroSection.css';
import HiroshimaCityScape from '../assets/hiroshima-city-scape.webp'; 

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-background-image" style={{ backgroundImage: `url(${HiroshimaCityScape})` }}></div>
      <div className="hero-overlay"></div>
      <div className="hero-container">
        <div className="hero-content">
          <h2 className="hero-title">ひろがる企業研究リスト</h2>
          <p className="hero-subtitle">
            就活生の「いい企業ないかな？」に応える
            広島の学生がつくった企業研究閲覧サイト
          </p>
        </div>
        <div className="hero-steps">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <div className="step-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="step-title">LINEログイン</h3>
              <p className="step-description">企業研究を<br/>無料で閲覧</p>
            </div>
          </div>
          <div className="step-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <div className="step-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </div>
              <h3 className="step-title">カスタム検索</h3>
              <p className="step-description">ピンと来る<br/>企業を探す</p>
            </div>
          </div>
          <div className="step-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <div className="step-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                </svg>
              </div>
              <h3 className="step-title">企業情報を深掘り</h3>
              <p className="step-description">企業HPやナビサイト<br/>に直接アクセス</p>
            </div>
          </div>
        </div>
        <div className="hero-stats-simple">
          <div className="stat-simple">
            <strong>100+</strong> 掲載企業数
          </div>
          <div className="stat-divider">•</div>
          <div className="stat-simple">
            <strong>250+</strong> 求人情報
          </div>
          <div className="stat-divider">•</div>
          <div className="stat-simple">
            <strong>1,000+</strong> 登録学生数
          </div>
        </div>
      </div>
    </section>
  );
};