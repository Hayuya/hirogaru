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
            就活生の「いい会社ないかな？」に応える、広島の学生がつくった企業研究閲覧サイト
          </p>
        </div>

        {/* === サイトの使い方ステップを追加 === */}
        <div className="hero-steps">
          <div className="step-item">
            <div className="step-number-container">
              <span className="step-number">01</span>
            </div>
            <div className="step-content">
              <h3 className="step-title">LINEログインでフル活用</h3>
              <p className="step-description">掲載企業の採用情報をまとめて無料で閲覧できます。</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <div className="step-number-container">
              <span className="step-number">02</span>
            </div>
            <div className="step-content">
              <h3 className="step-title">条件を絞って検索</h3>
              <p className="step-description">休日数や福利厚生など、希望の条件に合う企業だけを効率的に探せます。</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <div className="step-number-container">
              <span className="step-number">03</span>
            </div>
            <div className="step-content">
              <h3 className="step-title">企業のリアルを知る</h3>
              <p className="step-description">公式サイトや採用ページへ直接アクセスし、より多くの情報を得ましょう。</p>
            </div>
          </div>
        </div>
        {/* === ここまで追加 === */}

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