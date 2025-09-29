import React, { useState } from 'react';
import type { Company } from '../types/company';
import './CompanyCard.css';

interface CompanyCardProps {
  company: Company;
  isRestricted: boolean;
  displayRank: number;
  onViewDetails?: (company: Company) => void;
}

// --- HELPER FUNCTIONS ---

// Format gender ratio string (e.g., "8.6:1.3") to a female ratio percentage
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

// A simple component for displaying a detail item
const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value || 'N/A'}</span>
  </div>
);

// --- MAIN COMPONENT ---

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, isRestricted, displayRank, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    if (!isRestricted) {
      if (!isExpanded && onViewDetails) {
        onViewDetails(company);
      }
      setIsExpanded(!isExpanded);
    }
  };
  
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
            <div className="rating">
              <span className="rating-stars">★</span>
              <span className="rating-value">{company.rating.toFixed(2)} / 5.0</span>
              <span className="review-count">({company.employee_reviews_count}件)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="key-info">
          <div className="info-item">
            <span className="info-label">初任給</span>
            <span className="info-value highlight">{company.starting_salary_graduates || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">年間休日</span>
            <span className="info-value">{company.annual_holidays ? `${company.annual_holidays}日` : 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">勤務地</span>
            <span className="info-value">{company.work_location || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">平均残業</span>
            <span className="info-value">{company.average_overtime_hours ? `${company.average_overtime_hours}時間/月` : 'N/A'}</span>
          </div>
        </div>

        {isRestricted ? (
          <div className="restricted-overlay">
            <div className="restricted-message">
              <span className="lock-icon">🔒</span>
              <p>詳細情報はログイン後に閲覧できます</p>
            </div>
          </div>
        ) : (
          <>
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
                  <h4 className="detail-title">企業概要</h4>
                  <p className="detail-text">{company.company_overview_120}</p>
                </div>
                
                <div className="detail-section">
                  <h4 className="detail-title">募集要項抜粋</h4>
                  <p className="detail-text">{company.job_openings_excerpt}</p>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">企業データ</h4>
                  <div className="detail-grid">
                    <DetailItem label="本社所在地" value={company.headquarters_address} />
                    <DetailItem label="従業員数" value={company.number_of_employees ? `${company.number_of_employees}名` : 'N/A'} />
                    {/* UPDATED: Display revenue as a plain string */}
                    <DetailItem label="売上高" value={company.revenue === "N/A" ? '非公開' : company.revenue} />
                    <DetailItem label="平均年齢" value={company.average_age ? `${company.average_age}歳` : 'N/A'} />
                    <DetailItem label="平均勤続年数" value={company.average_years_of_service ? `${company.average_years_of_service}年` : 'N/A'} />
                    <DetailItem label="男女比率" value={formatGenderRatio(company.gender_ratio)} />
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">働き方・制度</h4>
                   <div className="detail-grid">
                    <DetailItem label="賞与" value={`${company.bonus_frequency_timing} (前年実績: ${company.bonus_previous_year_result || 'N/A'})`} />
                    <DetailItem label="有給取得率" value={company.paid_leave_usage_rate ? `${company.paid_leave_usage_rate}%` : 'N/A'} />
                    <DetailItem label="転勤" value={company.relocation} />
                    <DetailItem label="住宅手当" value={company.housing_allowance} />
                    <DetailItem label="食事補助" value={company.meal_subsidy} />
                    <DetailItem label="特別休暇" value={company.special_leave} />
                    <DetailItem label="資格取得支援" value={company.qualification_support} />
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">事業内容</h4>
                  <p className="detail-text">{company.main_business_products}</p>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">企業の強み・特徴</h4>
                  <p className="detail-text">{company.strengths_unique_points}</p>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">今後の展望</h4>
                  <p className="detail-text">{company.future_prospects}</p>
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
          </>
        )}
      </div>
    </div>
  );
};