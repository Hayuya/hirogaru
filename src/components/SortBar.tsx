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
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, order] = event.target.value.split('-') as [SortOption, 'asc' | 'desc'];
    onSortChange(key, order);
  };

  const currentValue = `${currentSort}-${sortOrder}`;

  return (
    <div className="sort-bar">
      <div className="sort-info">
        <span className="result-count">{totalCount}件の企業</span>
      </div>
      <div className="sort-options">
        <label htmlFor="sort-select" className="sort-label">並び替え:</label>
        <select id="sort-select" value={currentValue} onChange={handleSortChange} className="sort-select">
          {sortOptions.map(option => (
            <React.Fragment key={option.value}>
              <option value={`${option.value}-desc`}>{option.descLabel}</option>
              <option value={`${option.value}-asc`}>{option.ascLabel}</option>
            </React.Fragment>
          ))}
        </select>
      </div>
    </div>
  );
};