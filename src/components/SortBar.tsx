import React from 'react';
import type { SortOption } from '../types/company';
import './SortBar.css';

interface SortBarProps {
  currentSort: SortOption;
  totalCount: number;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'attractionScore', label: '総合魅力度が高い順' },
  { value: 'revenue', label: '売上高が高い順' },
  { value: 'number_of_employees', label: '従業員数が多い順' },
  { value: 'starting_salary_graduates', label: '初任給が高い順' },
  { value: 'annual_holidays', label: '年間休日が多い順' },
  { value: 'average_paid_leave_days', label: '有給取得日数が多い順' },
  { value: 'average_years_of_service', label: '勤続年数が長い順' },
  { value: 'average_age', label: '平均年齢が高い順' },
];

export const SortBar: React.FC<SortBarProps> = ({
  currentSort,
  totalCount,
  onSortChange,
}) => {
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value as SortOption);
  };

  return (
    <div className="sort-bar">
      <div className="sort-info">
        <span className="result-count">{totalCount}件の企業</span>
      </div>
      <div className="sort-options">
        <label htmlFor="sort-select" className="sort-label">並び替え:</label>
        <select id="sort-select" value={currentSort} onChange={handleSortChange} className="sort-select">
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};