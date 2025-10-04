import React from 'react';
import { INDUSTRIES } from '../types/company';
import './FilterBar.css';

// フィルタの型定義を更新
type OtherFilterKey =
  | 'relocation'
  | 'housingAllowance'
  | 'remoteWork'
  | 'flextime'
  | 'specialLeave'
  | 'fixedOvertimeSystem'; // fixedOvertimeSystem を追加

interface FilterBarProps {
  selectedIndustries: string[];
  filters: Record<OtherFilterKey, boolean>;
  onIndustryChange: (industries: string[]) => void;
  onFilterChange: (key: OtherFilterKey, checked: boolean) => void;
  onIndustryClick?: (industry: string, willSelect: boolean) => void;
  onOtherFilterClick?: (filterKey: OtherFilterKey, willSelect: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedIndustries,
  filters,
  onIndustryChange,
  onFilterChange,
  onIndustryClick,
  onOtherFilterClick,
}) => {
  const handleIndustryClick = (industry: string) => {
    const isSelected = selectedIndustries.includes(industry);
    onIndustryClick?.(industry, !isSelected);

    if (isSelected) {
      onIndustryChange([]);
    } else {
      onIndustryChange([industry]);
    }
  };

  const handleClearAll = () => {
    onIndustryChange([]);
    (Object.keys(filters) as OtherFilterKey[]).forEach(key => {
        onFilterChange(key, false);
    });
  };
  
  const hasActiveFilter = selectedIndustries.length > 0 || (Object.values(filters) as boolean[]).some(v => v);

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <h3 className="filter-title">業界カテゴリー</h3>
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
      </div>
      
      <div className="filter-section">
        <h3 className="filter-title">働き方・制度</h3>
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
                <span>固定残業代あり</span>
            </label>
        </div>
      </div>
      
      {hasActiveFilter && (
        <button className="clear-filters-btn" onClick={handleClearAll}>
          フィルターをクリア
        </button>
      )}
    </div>
  );
};