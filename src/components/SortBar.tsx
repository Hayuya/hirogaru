import React from 'react';
import type { SortOption } from '../types/company';
import './SortBar.css';

interface SortBarProps {
  currentSort: SortOption;
  sortOrder: 'asc' | 'desc';
  totalCount: number;
  onSortChange: (sort: SortOption, order: 'asc' | 'desc') => void;
}

const sortOptions: {
  value: SortOption;
  label: string;
  descLabel: string;
  ascLabel: string;
}[] = [
  {
    value: 'revenue',
    label: '売上高',
    descLabel: '売上高が高い順',
    ascLabel: '売上高が低い順',
  },
  {
    value: 'number_of_employees',
    label: '従業員数',
    descLabel: '従業員数が多い順',
    ascLabel: '従業員数が少ない順',
  },
  {
    value: 'starting_salary_graduates',
    label: '初任給',
    descLabel: '初任給が高い順',
    ascLabel: '初任給が低い順',
  },
  {
    value: 'base_salary',
    label: '基本給',
    descLabel: '基本給が高い順',
    ascLabel: '基本給が低い順',
  },
  {
    value: 'average_years_of_service',
    label: '平均勤続年数',
    descLabel: '勤続年数が長い順',
    ascLabel: '勤続年数が短い順',
  },
  {
    value: 'average_age',
    label: '平均年齢',
    descLabel: '平均年齢が高い順',
    ascLabel: '平均年齢が低い順',
  },
  {
    value: 'average_overtime_hours',
    label: '残業時間',
    descLabel: '残業時間が長い順',
    ascLabel: '残業時間が短い順',
  },
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
            aria-pressed={currentSort === option.value}
          >
            {currentSort === option.value
              ? sortOrder === 'desc'
                ? option.descLabel
                : option.ascLabel
              : option.label}
          </button>
        ))}
      </div>
    </div>
  );
};