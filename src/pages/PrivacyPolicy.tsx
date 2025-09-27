import React, { useEffect } from 'react';
import { Footer,type  FooterRoute } from '../components/Footer';
import './StaticPage.css';

interface PrivacyPolicyProps {
  onNavigate: (path: FooterRoute) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = 'プライバシーポリシー | ジモトデ';
  }, []);

  return (
    <div className="static-page">
      <main className="static-main">
        <div className="static-container">
          <h1 className="static-title">プライバシーポリシー</h1>
          <p className="static-updated">最終更新日: {new Date().toLocaleDateString('ja-JP')}</p>

          <section className="static-section">
            <h2>1. 個人情報の利用目的</h2>
            <p>
              当サービスでは、ユーザー体験の向上およびお問い合わせ対応のために、LINEユーザーIDなどの個人情報を取得する場合があります。取得した情報は、利用目的の範囲内でのみ使用し、適切に管理します。
            </p>
          </section>

          <section className="static-section">
            <h2>2. 個人情報の第三者提供</h2>
            <p>
              ユーザーの同意がある場合、法令に基づく場合、またはサービス提供に必要な業務委託先へ提供する場合を除き、第三者への開示は行いません。
            </p>
          </section>

          <section className="static-section">
            <h2>3. 個人情報の管理</h2>
            <p>
              個人情報への不正アクセス、紛失、破壊、改ざんおよび漏えいなどを防止するため、適切なセキュリティ対策を実施します。
            </p>
          </section>

          <section className="static-section">
            <h2>4. お問い合わせ</h2>
            <p>
              個人情報の取り扱いに関するお問い合わせは、サイト内の個別相談窓口またはサポートよりお気軽にご連絡ください。
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