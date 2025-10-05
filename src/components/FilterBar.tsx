import React, { useState } from 'react';
import { INDUSTRIES } from '../types/company';
import './FilterBar.css';

// フィルタの型定義を更新
type OtherFilterKey =
  | 'relocation'
  | 'housingAllowance'
  | 'remoteWork'
  | 'flextime'
  | 'specialLeave'
  | 'fixedOvertimeSystem'; // fixedOvertimeSystem を使用

interface FilterBarProps {
  selectedIndustries: string[];
  filters: Record<OtherFilterKey, boolean>;
  onIndustryChange: (industries: string[]) => void;
  onFilterChange: (key: OtherFilterKey, checked: boolean) => void;
  onIndustryClick?: (industry: string, willSelect: boolean) => void;
  onOtherFilterClick?: (filterKey: OtherFilterKey, willSelect: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchableCompanyCount: number;
}

const FilterIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const SearchIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedIndustries,
  filters,
  onIndustryChange,
  onFilterChange,
  onIndustryClick,
  onOtherFilterClick,
  searchQuery,
  onSearchChange,
  searchableCompanyCount,
}) => {
  const [isIndustryOpen, setIndustryOpen] = useState(false);
  const [isWelfareOpen, setWelfareOpen] = useState(false);

  const handleIndustryClick = (industry: string) => {
    const isSelected = selectedIndustries.includes(industry);
    onIndustryClick?.(industry, !isSelected);

    if (isSelected) {
      onIndustryChange([]);
    } else {
      onIndustryChange([industry]);
    }
  };

  const clearIndustries = () => onIndustryChange([]);
  const clearWelfareFilters = () => {
    (Object.keys(filters) as OtherFilterKey[]).forEach(key => {
        onFilterChange(key, false);
    });
  };

  const activeIndustryCount = selectedIndustries.length;
  const activeWelfareCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="filter-container">
      <div className="filter-card">
        <h3 className="filter-card-title">
          <FilterIcon />
          <span>条件で絞り込み</span>
        </h3>
        <div className="filter-card-content">
          <div className="collapsible-section">
            <button className="section-header" onClick={() => setIndustryOpen(!isIndustryOpen)}>
              <div className="section-header-title">
                <span className="section-title">○ 業界カテゴリーで絞る</span>
                {activeIndustryCount > 0 && <span className="active-filter-badge">{activeIndustryCount}</span>}
              </div>
              <span className={`chevron ${isIndustryOpen ? 'open' : ''}`}>▼</span>
            </button>
            {isIndustryOpen && (
              <div className="section-content">
                <div className="industry-tags">
                  {INDUSTRIES.map(industry => (
                    <button
                      key={industry}
                      type="button"
                      className={`industry-tag ${selectedIndustries.includes(industry) ? 'active' : ''}`}
                      onClick={() => handleIndustryClick(industry)}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
                {activeIndustryCount > 0 && (
                  <button className="clear-filters-btn" onClick={clearIndustries}>
                    クリア
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="collapsible-section">
            <button className="section-header" onClick={() => setWelfareOpen(!isWelfareOpen)}>
              <div className="section-header-title">
                <span className="section-title">○ 働き方・制度で絞る</span>
                {activeWelfareCount > 0 && <span className="active-filter-badge">{activeWelfareCount}</span>}
              </div>
              <span className={`chevron ${isWelfareOpen ? 'open' : ''}`}>▼</span>
            </button>
            {isWelfareOpen && (
              <div className="section-content">
                <div className="checkbox-filters">
                    <label className="checkbox-label">
                        <input type="checkbox" checked={filters.relocation} onChange={e => onFilterChange('relocation', e.target.checked)} />
                        <span>転勤なし</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" checked={filters.housingAllowance} onChange={e => onFilterChange('housingAllowance', e.target.checked)} />
                        <span>住宅手当あり</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" checked={filters.remoteWork} onChange={e => onFilterChange('remoteWork', e.target.checked)} />
                        <span>リモートワーク可</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" checked={filters.flextime} onChange={e => onFilterChange('flextime', e.target.checked)} />
                        <span>フレックスタイム制</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" checked={filters.specialLeave} onChange={e => onFilterChange('specialLeave', e.target.checked)} />
                        <span>特別休暇あり</span>
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" checked={filters.fixedOvertimeSystem} onChange={e => onFilterChange('fixedOvertimeSystem', e.target.checked)} />
                        <span>固定残業代なし</span>
                    </label>
                </div>
                {activeWelfareCount > 0 && (
                  <button className="clear-filters-btn" onClick={clearWelfareFilters}>
                    クリア
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="filter-card">
        <h3 className="filter-card-title">
          <SearchIcon />
          <span>企業名で検索</span>
        </h3>
        <div className="filter-card-content">
          <div className="search-form">
            <input
              type="text"
              placeholder={`${searchableCompanyCount}件の中から検索`}
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};