import React from 'react';
import { INDUSTRIES } from '../types/company';
import './FilterBar.css';

interface FilterBarProps {
  selectedIndustries: string[];
  femaleRatioFilter: boolean;
  relocationFilter: boolean;
  specialLeaveFilter: boolean;
  housingAllowanceFilter: boolean;
  onIndustryChange: (industries: string[]) => void;
  onFemaleRatioChange: (checked: boolean) => void;
  onRelocationChange: (checked: boolean) => void;
  onSpecialLeaveChange: (checked: boolean) => void;
  onHousingAllowanceChange: (checked: boolean) => void;
  onIndustryClick?: (industry: string, willSelect: boolean) => void;
  onOtherFilterClick?: (
    filterKey: 'femaleRatio' | 'relocation' | 'specialLeave' | 'housingAllowance',
    willSelect: boolean
  ) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedIndustries,
  femaleRatioFilter,
  relocationFilter,
  specialLeaveFilter,
  housingAllowanceFilter,
  onIndustryChange,
  onFemaleRatioChange,
  onRelocationChange,
  onSpecialLeaveChange,
  onHousingAllowanceChange,
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
    onFemaleRatioChange(false);
    onRelocationChange(false);
    onSpecialLeaveChange(false);
    onHousingAllowanceChange(false);
  };

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
        <h3 className="filter-title">その他の条件</h3>
        <div className="checkbox-filters">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={relocationFilter}
              onChange={(e) => {
                const checked = e.target.checked;
                onOtherFilterClick?.('relocation', checked);
                onRelocationChange(checked);
              }}
            />
            <span>転勤なし</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={specialLeaveFilter}
              onChange={(e) => {
                const checked = e.target.checked;
                onOtherFilterClick?.('specialLeave', checked);
                onSpecialLeaveChange(checked);
              }}
            />
            <span>特別休暇あり</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={housingAllowanceFilter}
              onChange={(e) => {
                const checked = e.target.checked;
                onOtherFilterClick?.('housingAllowance', checked);
                onHousingAllowanceChange(checked);
              }}
            />
            <span>住宅手当あり</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={femaleRatioFilter}
              onChange={(e) => {
                const checked = e.target.checked;
                onOtherFilterClick?.('femaleRatio', checked);
                onFemaleRatioChange(checked);
              }}
            />
            <span>女性比率30%以上</span>
          </label>
        </div>
      </div>
      
      {(selectedIndustries.length > 0 || femaleRatioFilter || relocationFilter || specialLeaveFilter || housingAllowanceFilter) && (
        <button className="clear-filters-btn" onClick={handleClearAll}>
          フィルターをクリア
        </button>
      )}
    </div>
  );
};
