import React, { useState } from 'react';
import type { Company } from '../types/company';
import { TriangleChart, type ChartStats } from './TriangleChart';
import './CompanyCard.css';

interface CompanyCardProps {
  company: Company;
  isRestricted: boolean;
  displayRank: number;
  onViewDetails?: (company: Company) => void;
  chartStats: ChartStats;
}

// --- HELPER FUNCTIONS ---

const formatValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === 'N/A' || value === '') {
    return '非公開';
  }
  return String(value);
};

const formatPrefecture = (address: string): string => {
    if (!address || address === 'N/A') return '非公開';
    // 住所文字列から都道府県名のみを抽出する (例: "〒123-4567 広島県..." -> "広島県")
    const match = address.match(/(北海道|.{2,3}[都道府県])/);
    // マッチした部分 (例: '広島県') を返す。マッチしない場合は元の住所を返す。
    return match ? match[0] : address;
};

const isTruthy = (value: any): boolean => {
    return String(value).toLowerCase() === 'true';
}

const formatGenderRatio = (ratioStr: string): string => {
  if (!ratioStr || ratioStr === "非公開" || ratioStr === "N/A") {
    return '非公開';
  }

  const parts = ratioStr.match(/(\d+\.?\d*)\s*:\s*(\d+\.?\d*)/);
  if (!parts || parts.length < 3) return '非公開';

  const male = parseFloat(parts[1]);
  const female = parseFloat(parts[2]);

  if (isNaN(male) || isNaN(female) || (male + female === 0)) {
    return '非公開';
  }

  const femalePercentage = (female / (male + female)) * 100;
  return `女性 ${femalePercentage.toFixed(1)}%`;
};

// Helper to count available welfare features
const countWelfareFeatures = (company: Company): number => {
  const features = [
    company.housing_allowance,
    company.remote_work,
    company.flextime,
    company.special_leave,
    company.qualification_support,
  ];
  return features.filter(isTruthy).length;
};

// New component for the visual display
const WelfareStatus: React.FC<{ count: number }> = ({ count }) => {
  const getColorClass = (num: number) => {
    if (num >= 4) return 'high';
    if (num >= 2) return 'medium';
    return 'low';
  };

  return (
    <div className={`welfare-status ${getColorClass(count)}`}>
      <span className="welfare-count">{count}</span>
      <span className="welfare-total">/ 5個</span>
      <span className="welfare-label">の制度あり</span>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{formatValue(value as string | number)}</span>
  </div>
);

const BooleanFeatureTag: React.FC<{ isAvailable: boolean; label: string }> = ({ isAvailable, label }) => (
    <div className={`boolean-feature-tag ${isAvailable ? 'available' : ''}`}>
      {label}
    </div>
  );


// --- MAIN COMPONENT ---

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, isRestricted, displayRank, onViewDetails, chartStats }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    // 常に詳細の開閉を可能にする
    if (!isExpanded && onViewDetails) {
      onViewDetails(company);
    }
    setIsExpanded(!isExpanded);
  };

  const attractionScore = company.attractionScore ?? 0;

  return (
    <div className={`company-card ${isRestricted ? 'restricted' : ''}`}>
      <div className="card-header">
        <div className="rank-badge">
          <span className="rank-number">{displayRank}</span>
          <span className="rank-label">位</span>
        </div>
        <div className="company-basic-info">
          <h3 className="company-name">{company.company_name}</h3>
          <div className="company-meta">
            <span className="industry-badge">{company.industry}</span>
            {isTruthy(company.fixed_overtime_system) && <span className="fixed-overtime-tag">固定残業代あり</span>}
            {!isRestricted && (
              <div className="rating">
                <span className="rating-stars">★</span>
                <span className="rating-value">{attractionScore.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="key-info">
          <div className="info-item">
            <span className="info-label">初任給</span>
            <span className="info-value highlight">{formatValue(company.starting_salary_graduates)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">従業員数</span>
            <span className="info-value">{company.number_of_employees ? `${company.number_of_employees}名` : '非公開'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">年間休日</span>
            <span className="info-value">{company.annual_holidays ? `${company.annual_holidays}日` : '非公開'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">本社所在地</span>
            <span className="info-value">{formatPrefecture(company.headquarters_address)}</span>
          </div>
        </div>

        {!isExpanded && (
          <button
            className="expand-button"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
          >
            詳細を見る
            <span className="expand-icon">▼</span>
          </button>
        )}

        {isExpanded && (
          <div className="expanded-content">

            <div className="detail-section">
              <h4 className="detail-title">企業バランスチャート</h4>
              {/* isRestrictedの状態をisDemoに渡してチャートの表示を制御 */}
              <TriangleChart company={company} stats={chartStats} isDemo={isRestricted} />
              {isRestricted && (
                <div className="chart-login-prompt">
                  <p>🔒 ログインすると詳細なチャートを閲覧できます</p>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h4 className="detail-title">企業概要</h4>
              <p className="detail-text">{formatValue(company.company_overview_120)}</p>
            </div>

            <div className="detail-section">
              <h4 className="detail-title">募集要項抜粋</h4>
              <p className="detail-text">{formatValue(company.job_openings_excerpt)}</p>
            </div>

            <div className="detail-section">
              <h4 className="detail-title">企業データ</h4>
              <div className="detail-grid">
                <DetailItem label="初任給" value={company.starting_salary_graduates} />
                <DetailItem label="従業員数" value={company.number_of_employees ? `${company.number_of_employees}名` : 'N/A'} />
                <DetailItem label="本社所在地" value={company.headquarters_address} />
                <DetailItem label="売上高" value={company.revenue} />
                <DetailItem label="年間休日" value={company.annual_holidays ? `${company.annual_holidays}日` : 'N/A'} />
                <DetailItem label="平均年齢" value={company.average_age ? `${company.average_age}歳` : 'N/A'} />
                <DetailItem label="平均勤続年数" value={company.average_years_of_service ? `${company.average_years_of_service}年` : 'N/A'} />
                <DetailItem label="男女比率" value={formatGenderRatio(company.gender_ratio)} />
                <DetailItem label="基本給" value={company.base_salary} />
                {isTruthy(company.fixed_overtime_system) && <DetailItem label="固定残業代" value={company.fixed_overtime_allowance} />}
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-title">働き方・制度</h4>
              <WelfareStatus count={countWelfareFeatures(company)} />
              <div className="boolean-features-grid">
                  {isTruthy(company.housing_allowance) && <BooleanFeatureTag isAvailable={true} label="住宅手当" />}
                  {isTruthy(company.remote_work) && <BooleanFeatureTag isAvailable={true} label="リモートワーク" />}
                  {isTruthy(company.flextime) && <BooleanFeatureTag isAvailable={true} label="フレックスタイム" />}
                  {isTruthy(company.special_leave) && <BooleanFeatureTag isAvailable={true} label="特別休暇" />}
                  {isTruthy(company.qualification_support) && <BooleanFeatureTag isAvailable={true} label="資格取得支援" />}
              </div>
            </div>


            <div className="detail-section">
              <h4 className="detail-title">事業内容</h4>
              <p className="detail-text">{formatValue(company.main_business_products)}</p>
            </div>

            <div className="detail-section">
              <h4 className="detail-title">企業の強み・特徴</h4>
              <p className="detail-text">{formatValue(company.strengths_unique_points)}</p>
            </div>

            <div className="action-buttons">
              <a href={company.official_website_url} target="_blank" rel="noopener noreferrer" className="action-button primary">
                企業サイトを見る
              </a>
              <a href={company.recruitment_page_url} target="_blank" rel="noopener noreferrer" className="action-button secondary">
                採用情報を見る
              </a>
            </div>

            <button
              className="expand-button close-button"
              onClick={toggleExpanded}
              aria-expanded={isExpanded}
            >
              詳細を閉じる
              <span className="expand-icon">▲</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};