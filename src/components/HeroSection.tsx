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
            広島で働く、未来をつくる。厳選した優良企業を限定でご紹介します。
          </p>
          <p className="hero-description">
            給与、休日、福利厚生など、あなたの希望に合った企業を見つけましょう。
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">掲載企業数</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">250+</span>
            <span className="stat-label">求人情報</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1,000+</span>
            <span className="stat-label">登録学生数</span>
          </div>
        </div>
      </div>
    </section>
  );
};