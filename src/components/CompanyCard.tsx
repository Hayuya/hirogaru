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
    const match = address.match(/^(.+?[都道府県])/);
    return match ? match[1] : address;
}

const isTruthy = (value: any): boolean => {
    return String(value).toLowerCase() === 'true';
}

const parseNumericValue = (value: string | number | undefined | null): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const match = String(value).match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
};

const calculateScore = (value: number, mean: number, stdDev: number): number => {
  const zScore = stdDev === 0 ? 0 : (value - mean) / stdDev;
  const clampedZ = Math.max(-1.5, Math.min(1.5, zScore));
  const normalized = (clampedZ + 1.5) / 3;
  return 20 + normalized * 80;
};

// Convert 0-100 score to 1-5 rating
const scoreToRating = (score: number): number => {
  return Math.min(5, Math.max(1, Math.round(score / 20)));
};


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

  // --- Attraction Score Calculation ---
  const salaryValue = parseNumericValue(company.base_salary);
  const employeesValue = company.number_of_employees;
  const holidaysValue = company.annual_holidays;

  const isPrivateSalary = salaryValue <= 0;
  const isPrivateEmployees = employeesValue <= 0;
  const isPrivateHolidays = holidaysValue <= 0;

  const effectiveSalaryValue = isPrivateSalary ? chartStats.salary.mean : salaryValue;
  const effectiveEmployeesValue = isPrivateEmployees ? Math.pow(10, chartStats.employees.mean) : employeesValue;
  const effectiveHolidaysValue = isPrivateHolidays ? chartStats.holidays.mean : holidaysValue;

  const scores = {
    salary: isPrivateSalary ? 60 : calculateScore(effectiveSalaryValue, chartStats.salary.mean, chartStats.salary.stdDev),
    employees: isPrivateEmployees ? 60 : calculateScore(Math.log10(effectiveEmployeesValue), chartStats.employees.mean, chartStats.employees.stdDev),
    holidays: isPrivateHolidays ? 60 : calculateScore(effectiveHolidaysValue, chartStats.holidays.mean, chartStats.holidays.stdDev),
  };

  let ratings = {
    salary: isPrivateSalary ? 2 : scoreToRating(scores.salary),
    employees: isPrivateEmployees ? 2 : scoreToRating(scores.employees),
    holidays: isPrivateHolidays ? 2 : scoreToRating(scores.holidays),
  };

  if (isRestricted) {
    ratings = { salary: 4, holidays: 4, employees: 3 };
  }

  const attractionScore = ((ratings.salary + ratings.holidays + ratings.employees) / 3).toFixed(1);

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
            <div className="rating">
              <span className="rating-stars">★</span>
              <span className="rating-value">{attractionScore} / 5.0</span>
            </div>
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

        {/* 常に「詳細を見る」ボタンを表示 */}
        <button
          className="expand-button"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '詳細を閉じる' : '詳細を見る'}
          <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
        </button>

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

          </div>
        )}
      </div>
    </div>
  );
};