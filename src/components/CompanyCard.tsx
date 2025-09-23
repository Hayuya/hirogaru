import React, { useState } from 'react';
import type { Company } from '../types/company';
import './CompanyCard.css';

interface CompanyCardProps {
  company: Company;
  isRestricted: boolean;
  displayRank: number; // 親コンポーネントから渡される動的な順位
  onViewDetails?: (company: Company) => void;
}

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

  // 売上高をフォーマット
  const formatRevenue = (revenue: string) => {
    const num = parseFloat(revenue);
    if (num >= 100000000000) {
      return `${(num / 100000000000).toFixed(1)}兆円`;
    } else if (num >= 100000000) {
      return `${(num / 100000000).toFixed(0)}億円`;
    } else if (num >= 10000000) {
      return `${(num / 10000000).toFixed(0)}千万円`;
    } else {
      return `${(num / 10000).toFixed(0)}万円`;
    }
  };

  // 評価の星を表示
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar && fullStars < 5) {
      stars.push('☆');
    }
    return stars.join('');
  };

  return (
    <div className={`company-card ${isRestricted ? 'restricted' : ''}`}>
      <div className="card-header">
        <div className="rank-badge">
          {/* company.rank の代わりに displayRank を使用 */}
          <span className="rank-number">{displayRank}</span>
          <span className="rank-label">位</span>
        </div>
        <div className="company-basic-info">
          <h3 className="company-name">{company.company_name}</h3>
          <div className="company-meta">
            <span className="industry-badge">{company.industry}</span>
            <div className="rating">
              <span className="rating-stars">{renderRating(company.rating)}</span>
              <span className="rating-value">{company.rating}</span>
              <span className="review-count">({company.employee_reviews_count}件)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="key-info">
          <div className="info-item">
            <span className="info-label">初任給</span>
            <span className="info-value highlight">{company.starting_salary_graduates}</span>
          </div>
          <div className="info-item">
            <span className="info-label">年間休日</span>
            <span className="info-value">{company.annual_holidays}日</span>
          </div>
          <div className="info-item">
            <span className="info-label">勤務地</span>
            <span className="info-value">{company.work_location}</span>
          </div>
          <div className="info-item">
            <span className="info-label">平均残業</span>
            <span className="info-value">{company.average_overtime_hours}時間/月</span>
          </div>
        </div>

        {isRestricted ? (
          <div className="restricted-overlay">
            <div className="restricted-message">
              <span className="lock-icon">🔒</span>
              <p>詳細情報は登録後に閲覧できます</p>
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
                  <h4 className="detail-title">基本情報</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">本社所在地</span>
                      <span className="detail-value">{company.headquarters_address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">従業員数</span>
                      <span className="detail-value">{company.number_of_employees}名</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">売上高</span>
                      <span className="detail-value">{formatRevenue(company.revenue)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">男女比率</span>
                      <span className="detail-value">{company.gender_ratio}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">平均年齢</span>
                      <span className="detail-value">{company.average_age}歳</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">平均勤続年数</span>
                      <span className="detail-value">{company.average_years_of_service}年</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">待遇・福利厚生</h4>
                  <div className="welfare-grid">
                    <div className="welfare-item">
                      <span className="welfare-label">賞与</span>
                      <span className="welfare-value">{company.bonus_frequency_timing}</span>
                      <span className="welfare-extra">前年実績: {company.bonus_previous_year_result}</span>
                    </div>
                    <div className="welfare-item">
                      <span className="welfare-label">有給取得率</span>
                      <span className="welfare-value">{company.paid_leave_usage_rate}%</span>
                    </div>
                    <div className="welfare-tags">
                      {company.housing_allowance === 'あり' && <span className="tag">住宅手当</span>}
                      {company.meal_subsidy === 'あり' && <span className="tag">食事補助</span>}
                      {company.special_leave === 'あり' && <span className="tag">特別休暇</span>}
                      {company.qualification_support === 'あり' && <span className="tag">資格支援</span>}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">強み・特徴</h4>
                  <p className="detail-text">{company.strengths_unique_points}</p>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">今後の展望 </h4>
                  <p className="detail-text">{company.future_prospects}</p>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">募集要項</h4>
                  <p className="detail-text">{company.job_openings_excerpt}</p>
                </div>

                <div className="action-buttons">
                  <a
                    href={company.official_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button primary"
                  >
                    企業サイトを見る
                  </a>
                  <a
                    href={company.recruitment_page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button secondary"
                  >
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
