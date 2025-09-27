import React, { useEffect } from 'react';
import { Footer,type FooterRoute } from '../components/Footer';
import './StaticPage.css';

interface DisclaimerProps {
  onNavigate: (path: FooterRoute) => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = '免責事項 | ジモトデ';
  }, []);

  return (
    <div className="static-page">
      <main className="static-main">
        <div className="static-container">
          <h1 className="static-title">免責事項</h1>
          <p className="static-updated">最終更新日: {new Date().toLocaleDateString('ja-JP')}</p>

          <section className="static-section">
            <h2>1. 情報の正確性</h2>
            <p>
              掲載している企業情報・求人情報については正確な内容を提供するよう努めておりますが、その正確性や完全性を保証するものではありません。最新の情報は各企業の公式サイトや採用担当者に直接ご確認ください。
            </p>
          </section>

          <section className="static-section">
            <h2>2. 免責事項</h2>
            <p>
              本サイトの利用によって生じたいかなる損害に対しても、当サービスは一切の責任を負いません。利用者自身の判断と責任においてご利用ください。
            </p>
          </section>

          <section className="static-section">
            <h2>3. 外部リンクについて</h2>
            <p>
              本サイトからリンクする外部サイトの内容について、当サービスは責任を負いません。外部サイトのご利用にあたっては、それぞれの利用規約等をご確認ください。
            </p>
          </section>

          <section className="static-section">
            <h2>4. 本免責事項の変更</h2>
            <p>
              免責事項の内容は予告なく変更される場合があります。変更後の内容は本ページに掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <div className="back-to-top-container">
            <button 
              onClick={() => onNavigate('/')} 
              className="back-to-top-button"
            >
              トップへ戻る
            </button>
          </div>
        </div>
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};