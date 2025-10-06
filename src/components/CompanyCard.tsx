import React, { useState, useRef, useEffect } from 'react';
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

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value}</span>
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
  const cardRef = useRef<HTMLDivElement>(null);
  const wasExpanded = useRef(false);

  useEffect(() => {
    // Check if the card was expanded and is now closed.
    if (wasExpanded.current && !isExpanded && cardRef.current) {
      const cardElement = cardRef.current;
      const nextSibling = cardElement.nextElementSibling as HTMLElement;

      if (nextSibling) {
        const cardRect = cardElement.getBoundingClientRect();
        const nextRect = nextSibling.getBoundingClientRect();
        
        // Midpoint of the vertical space between the bottom of the current card and the top of the next card.
        const gapCenter = (cardRect.bottom + nextRect.top) / 2;
        
        // Desired position for the center of the viewport.
        const viewportCenter = window.innerHeight / 2;
        
        // How much to scroll to align the gap center with the viewport center.
        const scrollAmount = gapCenter - viewportCenter;
        
        // 瞬間移動（目標位置より少し下に移動）
        const overshoot = -5; // オーバーシュート量（ピクセル）
        window.scrollBy({
          top: scrollAmount + overshoot,
          behavior: 'instant'
        });
        
        // 微細な「余韻」アニメーション
        setTimeout(() => {
          // イージングアニメーションで最終位置へ
          const startTime = performance.now();
          const duration = 300; // アニメーション時間（ミリ秒）
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // イージング関数（ease-out-cubic）
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            // スクロール位置を調整
            const currentScroll = window.scrollY;
            const targetScroll = currentScroll - (overshoot * (1 - easeOutCubic));
            window.scrollTo({
              top: targetScroll,
              behavior: 'instant'
            });
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }, 10); // 瞬間移動後、わずかに遅延してから余韻アニメーション開始
      }
    }
    // Update the wasExpanded ref for the next render.
    wasExpanded.current = isExpanded;
  }, [isExpanded]);

  const toggleExpanded = () => {
    // 常に詳細の開閉を可能にする
    if (!isExpanded && onViewDetails) {
      onViewDetails(company);
    }
    setIsExpanded(!isExpanded);
  };

  const attractionScore = company.attractionScore ?? 0;

  return (
    <div ref={cardRef} className={`company-card ${isRestricted ? 'restricted' : ''}`}>
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

            {company.company_overview_120 && company.company_overview_120 !== 'N/A' && (
              <div className="detail-section">
                <h4 className="detail-title">企業概要</h4>
                <p className="detail-text">{company.company_overview_120}</p>
              </div>
            )}

            {company.job_openings_excerpt && company.job_openings_excerpt !== 'N/A' && (
              <div className="detail-section">
                <h4 className="detail-title">募集要項抜粋</h4>
                <p className="detail-text">{company.job_openings_excerpt}</p>
              </div>
            )}

            <div className="detail-section">
              <h4 className="detail-title">企業データ</h4>
              <div className="detail-grid">
                {company.headquarters_address && company.headquarters_address !== 'N/A' && <DetailItem label="本社所在地" value={company.headquarters_address} />}
                {company.work_location && company.work_location !== 'N/A' && <DetailItem label="勤務地" value={company.work_location} />}
                {company.relocation && company.relocation !== 'N/A' && <DetailItem label="転勤" value={company.relocation} />}
                {company.number_of_employees ? <DetailItem label="従業員数" value={`${company.number_of_employees}名`} /> : null}
                {company.revenue && company.revenue !== 'N/A' && <DetailItem label="売上高" value={company.revenue} />}
                {company.starting_salary_graduates && company.starting_salary_graduates !== 'N/A' && <DetailItem label="初任給" value={company.starting_salary_graduates} />}
                {isTruthy(company.fixed_overtime_system) && company.fixed_overtime_allowance && company.fixed_overtime_allowance !== 'N/A' && <DetailItem label="固定残業代" value={company.fixed_overtime_allowance} />}
                {company.bonus_frequency_timing && company.bonus_frequency_timing !== 'N/A' && <DetailItem label="賞与" value={company.bonus_frequency_timing} />}
                {company.annual_holidays ? <DetailItem label="年間休日" value={`${company.annual_holidays}日`} /> : null}
                {company.average_paid_leave_days ? <DetailItem label="平均有給取得日数" value={`${company.average_paid_leave_days}日`} /> : null}
                {company.paid_leave_usage_rate ? <DetailItem label="有給休暇取得率" value={`${company.paid_leave_usage_rate}%`} /> : null}
                {company.average_overtime_hours ? <DetailItem label="平均残業時間" value={`${company.average_overtime_hours}時間`} /> : null}
                {company.average_age ? <DetailItem label="平均年齢" value={`${company.average_age}歳`} /> : null}
                {company.average_years_of_service ? <DetailItem label="平均勤続年数" value={`${company.average_years_of_service}年`} /> : null}
                {(() => {
                  const ratio = formatGenderRatio(company.gender_ratio);
                  return ratio !== '非公開' ? <DetailItem label="男女比率" value={ratio} /> : null;
                })()}
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-title">働き方・制度</h4>
              <div className="boolean-features-grid">
                  {isTruthy(company.housing_allowance) && <BooleanFeatureTag isAvailable={true} label="住宅手当" />}
                  {isTruthy(company.remote_work) && <BooleanFeatureTag isAvailable={true} label="リモートワーク" />}
                  {isTruthy(company.flextime) && <BooleanFeatureTag isAvailable={true} label="フレックスタイム" />}
                  {isTruthy(company.special_leave) && <BooleanFeatureTag isAvailable={true} label="特別休暇" />}
                  {isTruthy(company.qualification_support) && <BooleanFeatureTag isAvailable={true} label="資格取得支援" />}
              </div>
            </div>


            {company.main_business_products && company.main_business_products !== 'N/A' && (
              <div className="detail-section">
                <h4 className="detail-title">事業内容</h4>
                <p className="detail-text">{company.main_business_products}</p>
              </div>
            )}

            {company.strengths_unique_points && company.strengths_unique_points !== 'N/A' && (
              <div className="detail-section">
                <h4 className="detail-title">企業の強み・特徴</h4>
                <p className="detail-text">{company.strengths_unique_points}</p>
              </div>
            )}
            
            {company.future_prospects && company.future_prospects !== 'N/A' && (
              <div className="detail-section">
                <h4 className="detail-title">今後の展望</h4>
                <p className="detail-text">{company.future_prospects}</p>
              </div>
            )}

            <div className="action-buttons">
              <a href={company.official_website_url} target="_blank" rel="noopener noreferrer" className="action-button primary">
                企業サイトを見る
              </a>
              <a href={company.recruitment_page_url} target="_blank" rel="noopener noreferrer" className="action-button secondary">
                採用情報を見る
              </a>
              {company.reference_url_mynavi_rikunavi && company.reference_url_mynavi_rikunavi !== 'N/A' && (
                <a href={company.reference_url_mynavi_rikunavi} target="_blank" rel="noopener noreferrer" className="action-button secondary">
                  マイナビ/リクナビで見る
                </a>
              )}
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