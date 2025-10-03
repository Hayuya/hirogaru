import React from 'react';
import type { Company } from '../types/company';
import './TriangleChart.css';

const parseNumericValue = (value: string | number | undefined | null): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const match = String(value).match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
};

const calculateScore = (value: number, mean: number, stdDev: number): number => {
  const zScore = stdDev === 0 ? 0 : (value - mean) / stdDev;
  const clampedZ = Math.max(-1.5, Math.min(1.5, zScore));
  const normalized = (clampedZ + 1.5) / 3;
  return 20 + normalized * 80;
};

export interface ChartStats {
  salary: { mean: number; stdDev: number };
  employees: { mean: number; stdDev: number };
  holidays: { mean: number; stdDev: number };
}

interface TriangleChartProps {
  company: Company;
  stats: ChartStats;
}

export const TriangleChart: React.FC<TriangleChartProps> = ({ company, stats }) => {
  const salaryValue = parseNumericValue(company.base_salary);
  const employeesValue = company.number_of_employees;
  const holidaysValue = company.annual_holidays;

  if (salaryValue <= 0 || employeesValue <= 0 || holidaysValue <= 0) {
    return (
      <div className="triangle-chart-unavailable">
        <p>チャート表示に必要なデータの一部が非公開です。</p>
      </div>
    );
  }
  
  const SIZE = 260;
  const center = SIZE / 2;
  const radius = SIZE * 0.30;

  const getPoint = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle - Math.PI / 2),
    y: center + r * Math.sin(angle - Math.PI / 2),
  });

  const angles = {
    salary: 0,
    holidays: (2 * Math.PI) / 3,
    employees: (4 * Math.PI) / 3,
  };

  const scores = {
    salary: calculateScore(salaryValue, stats.salary.mean, stats.salary.stdDev),
    employees: calculateScore(Math.log10(employeesValue), stats.employees.mean, stats.employees.stdDev),
    holidays: calculateScore(holidaysValue, stats.holidays.mean, stats.holidays.stdDev),
  };
  
  const dataPoints = {
    salary: getPoint(angles.salary, radius * (scores.salary / 100)),
    holidays: getPoint(angles.holidays, radius * (scores.holidays / 100)),
    employees: getPoint(angles.employees, radius * (scores.employees / 100)),
  };
  
  const polygonPoints = `${dataPoints.salary.x},${dataPoints.salary.y} ${dataPoints.holidays.x},${dataPoints.holidays.y} ${dataPoints.employees.x},${dataPoints.employees.y}`;

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="triangle-chart-wrapper">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="triangle-chart-svg">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.15" />
          </linearGradient>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* グリッド */}
        <g className="chart-grid">
          {gridLevels.map((level) => (
            <polygon
              key={level}
              points={`${getPoint(angles.salary, radius * level).x},${getPoint(angles.salary, radius * level).y} ${getPoint(angles.holidays, radius * level).x},${getPoint(angles.holidays, radius * level).y} ${getPoint(angles.employees, radius * level).x},${getPoint(angles.employees, radius * level).y}`}
              className="grid-line"
            />
          ))}
        </g>

        {/* データエリア */}
        <polygon 
          points={polygonPoints} 
          className="chart-area"
          fill="url(#chartGradient)"
        />

        {/* データの輪郭 */}
        <polygon 
          points={polygonPoints} 
          className="chart-border"
          fill="none"
        />

        {/* データポイント */}
        <circle cx={dataPoints.salary.x} cy={dataPoints.salary.y} r="5" className="chart-point point-salary" filter="url(#softGlow)" />
        <circle cx={dataPoints.holidays.x} cy={dataPoints.holidays.y} r="5" className="chart-point point-holidays" filter="url(#softGlow)" />
        <circle cx={dataPoints.employees.x} cy={dataPoints.employees.y} r="5" className="chart-point point-employees" filter="url(#softGlow)" />

        {/* ラベル */}
        <text x={center} y={getPoint(angles.salary, radius).y - 20} className="chart-label">給与</text>
        <text x={getPoint(angles.holidays, radius).x - 28} y={getPoint(angles.holidays, radius).y + 6} className="chart-label label-left">休日</text>
        <text x={getPoint(angles.employees, radius).x + 28} y={getPoint(angles.employees, radius).y + 6} className="chart-label label-right">規模</text>
      </svg>
    </div>
  );
};