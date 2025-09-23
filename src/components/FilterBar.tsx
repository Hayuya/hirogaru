import React from 'react';
import { INDUSTRIES } from '../types/company';
import './FilterBar.css';

interface FilterBarProps {
  selectedIndustries: string[];
  femaleRatioFilter: boolean;
  welfareFilter: boolean;
  onIndustryChange: (industries: string[]) => void;
  onFemaleRatioChange: (checked: boolean) => void;
  onWelfareChange: (checked: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedIndustries,
  femaleRatioFilter,
  welfareFilter,
  onIndustryChange,
  onFemaleRatioChange,
  onWelfareChange,
}) => {
  const handleIndustryClick = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      onIndustryChange(selectedIndustries.filter(i => i !== industry));
    } else {
      onIndustryChange([...selectedIndustries, industry]);
    }
  };

  const handleClearAll = () => {
    onIndustryChange([]);
    onFemaleRatioChange(false);
    onWelfareChange(false);
  };

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <h3 className="filter-title">業界カテゴリー</h3>
        <div className="industry-tags">
          {INDUSTRIES.map(industry => (
            <button
              key={industry}
              className={`industry-tag ${selectedIndustries.includes(industry) ? 'active' : ''}`}
              onClick={() => handleIndustryClick(industry)}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h3 className="filter-title">その他の条件</h3>
        <div className="checkbox-filters">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={femaleRatioFilter}
              onChange={(e) => onFemaleRatioChange(e.target.checked)}
            />
            <span>女性比率30%以上</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={welfareFilter}
              onChange={(e) => onWelfareChange(e.target.checked)}
            />
            <span>充実した福利厚生</span>
          </label>
        </div>
      </div>
      
      {(selectedIndustries.length > 0 || femaleRatioFilter || welfareFilter) && (
        <button className="clear-filters-btn" onClick={handleClearAll}>
          フィルターをクリア
        </button>
      )}
    </div>
  );
};