import React from 'react';
import './Footer.css';

export type FooterRoute = '/' | '/privacy-policy' | '/disclaimer';

interface FooterProps {
  onNavigate: (path: FooterRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, path: FooterRoute) => {
    event.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">ジモトデ</span>
          <p className="footer-description">広島で働きたい学生のための企業発見プラットフォーム。</p>
        </div>
        <nav className="footer-links">
          <a href="/privacy-policy" onClick={(e) => handleClick(e, '/privacy-policy')}>
            プライバシーポリシー
          </a>
          <a href="/disclaimer" onClick={(e) => handleClick(e, '/disclaimer')}>
            免責事項
          </a>
        </nav>
        <div className="footer-copy">© {new Date().getFullYear()} ジモトデ. All rights reserved.</div>
      </div>
    </footer>
  );
};
