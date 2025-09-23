import React from 'react';
import type { SortOption } from '../types/company';
import './SortBar.css';

interface SortBarProps {
  currentSort: SortOption;
  sortOrder: 'asc' | 'desc';
  totalCount: number;
  onSortChange: (sort: SortOption, order: 'asc' | 'desc') => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'starting_salary_graduates', label: '初任給' },
  { value: 'revenue', label: '売上高' },
  { value: 'number_of_employees', label: '従業員数' },
  { value: 'average_overtime_hours', label: '残業時間' },
  { value: 'average_years_of_service', label: '平均勤続年数' },
  { value: 'average_age', label: '平均年齢' },
];

export const SortBar: React.FC<SortBarProps> = ({
  currentSort,
  sortOrder,
  totalCount,
  onSortChange,
}) => {
  const handleSortClick = (sort: SortOption) => {
    if (currentSort === sort) {
      // 同じソート項目をクリックした場合は順序を反転
      onSortChange(sort, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 新しいソート項目を選択した場合は降順から開始
      onSortChange(sort, 'desc');
    }
  };

  return (
    <div className="sort-bar">
      <div className="sort-info">
        <span className="result-count">{totalCount}件の企業</span>
      </div>
      <div className="sort-options">
        <span className="sort-label">並び替え:</span>
        {sortOptions.map(option => (
          <button
            key={option.value}
            className={`sort-button ${currentSort === option.value ? 'active' : ''}`}
            onClick={() => handleSortClick(option.value)}
          >
            {option.label}
            {currentSort === option.value && (
              <span className="sort-arrow">
                {sortOrder === 'desc' ? '↓' : '↑'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};