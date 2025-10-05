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

// Convert 0-100 score to 1-5 ratzing
const scoreToRating = (score: number): number => {
  return Math.min(5, Math.max(1, Math.round(score / 20)));
};

// Get color based on rating (1-5) - 元のグラデーションに戻す　
const getRatingColor = (rating: number): string => {
  switch (rating) {
    case 5: return '#EF4444'; // 赤
    case 4: return '#F97316'; // 橙
    case 3: return '#EAB308'; // 黄
    case 2: return '#22C55E'; // 緑
    case 1: return '#3B82F6'; // 青
    default: return '#94A3B8'; // グレー（フォールバック）
  }
};

const gradientBlue = '#87CEEB'; // エリアのグラデーション用の薄い青色

// Get average rating color for attraction score
const getAverageRatingColor = (avgRating: number): string => {
  const rounded = Math.round(avgRating);
  return getRatingColor(rounded);
};

export interface ChartStats {
  salary: { mean: number; stdDev: number };
  employees: { mean: number; stdDev: number };
  holidays: { mean: number; stdDev: number };
}

interface TriangleChartProps {
  company: Company;
  stats: ChartStats;
  isDemo?: boolean;
}

export const TriangleChart: React.FC<TriangleChartProps> = ({ company, stats, isDemo = false }) => {
  const salaryValue = parseNumericValue(company.base_salary);
  const employeesValue = company.number_of_employees;
  const holidaysValue = company.annual_holidays;

  // 非公開データのフラグと実際に使用する値
  const isPrivateSalary = salaryValue <= 0;
  const isPrivateEmployees = employeesValue <= 0;
  const isPrivateHolidays = holidaysValue <= 0;

  // 非公開の場合は中間値（3）を使用
  const effectiveSalaryValue = isPrivateSalary ? stats.salary.mean : salaryValue;
  const effectiveEmployeesValue = isPrivateEmployees ? Math.pow(10, stats.employees.mean) : employeesValue;
  const effectiveHolidaysValue = isPrivateHolidays ? stats.holidays.mean : holidaysValue;

  // 全てが非公開の場合の特別処理（オプション）
  const allPrivate = isPrivateSalary && isPrivateEmployees && isPrivateHolidays;
  
  const SIZE = 400;
  const center = SIZE / 2;
  const radius = SIZE * 0.32;
  const labelRadius = radius * 1.45;

  const getPoint = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle - Math.PI / 2),
    y: center + r * Math.sin(angle - Math.PI / 2),
  });

  const angles = {
    salary: 0,
    holidays: (2 * Math.PI) / 3,
    employees: (4 * Math.PI) / 3,
  };

  // スコア計算（非公開の場合は3固定）
  const scores = {
    salary: isPrivateSalary ? 60 : calculateScore(effectiveSalaryValue, stats.salary.mean, stats.salary.stdDev),
    employees: isPrivateEmployees ? 60 : calculateScore(Math.log10(effectiveEmployeesValue), stats.employees.mean, stats.employees.stdDev),
    holidays: isPrivateHolidays ? 60 : calculateScore(effectiveHolidaysValue, stats.holidays.mean, stats.holidays.stdDev),
  };

  // 5段階評価に変換（非公開の場合は3固定）
  let ratings = {
    salary: isPrivateSalary ? 2 : scoreToRating(scores.salary),
    employees: isPrivateEmployees ? 2 : scoreToRating(scores.employees),
    holidays: isPrivateHolidays ? 2 : scoreToRating(scores.holidays),
  };

  // isDemoがtrueの場合、評価を固定値で上書き
  if (isDemo) {
    ratings = {
      salary: 4,
      holidays: 4,
      employees: 3,
    };
  }
  
  const dataPoints = {
    salary: getPoint(angles.salary, radius * (ratings.salary / 5)),
    holidays: getPoint(angles.holidays, radius * (ratings.holidays / 5)),
    employees: getPoint(angles.employees, radius * (ratings.employees / 5)),
  };
  
  const polygonPoints = `${dataPoints.salary.x},${dataPoints.salary.y} ${dataPoints.holidays.x},${dataPoints.holidays.y} ${dataPoints.employees.x},${dataPoints.employees.y}`;

  // 5段階のグリッドレベル
  const gridLevels = [1, 2, 3, 4, 5];

  // 注意書きメッセージの生成
  const noteMessages: string[] = [];
  if (!isDemo) {
    if (isPrivateSalary) noteMessages.push('給与は非公開のため2とする');
    if (isPrivateHolidays) noteMessages.push('休日は非公開のため2とする');
    if (isPrivateEmployees) noteMessages.push('規模は非公開のため2とする');
  }


  // 魅力点の計算（3つの評価の平均）
  const attractionScore = ((ratings.salary + ratings.holidays + ratings.employees) / 3).toFixed(1);
  const attractionScoreInt = Math.round(parseFloat(attractionScore));
  const attractionScoreColor = getAverageRatingColor(parseFloat(attractionScore));

  // 各ポイントの色
  const pointColors = {
    salary: getRatingColor(ratings.salary),
    holidays: getRatingColor(ratings.holidays),
    employees: getRatingColor(ratings.employees)
  };

  // スター表示用の配列作成
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg key={i} className="star" viewBox="0 0 24 24">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            style={{ 
              fill: i <= attractionScoreInt ? attractionScoreColor : '#e5e7eb'
            }}
          />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className={`triangle-chart-container ${isDemo ? 'demo' : ''}`}>
      <div className="triangle-chart-wrapper">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="triangle-chart-svg">
          <defs>
            {/* 各頂点からのグラデーション */}
            <radialGradient id="salaryGradient" cx={`${dataPoints.salary.x / SIZE * 100}%`} cy={`${dataPoints.salary.y / SIZE * 100}%`} r="50%">
              <stop offset="0%" stopColor={gradientBlue} stopOpacity="0.4" />
              <stop offset="100%" stopColor={gradientBlue} stopOpacity="0.05" />
            </radialGradient>
            
            <radialGradient id="holidaysGradient" cx={`${dataPoints.holidays.x / SIZE * 100}%`} cy={`${dataPoints.holidays.y / SIZE * 100}%`} r="50%">
              <stop offset="0%" stopColor={gradientBlue} stopOpacity="0.4" />
              <stop offset="100%" stopColor={gradientBlue} stopOpacity="0.05" />
            </radialGradient>
            
            <radialGradient id="employeesGradient" cx={`${dataPoints.employees.x / SIZE * 100}%`} cy={`${dataPoints.employees.y / SIZE * 100}%`} r="50%">
              <stop offset="0%" stopColor={gradientBlue} stopOpacity="0.4" />
              <stop offset="100%" stopColor={gradientBlue} stopOpacity="0.05" />
            </radialGradient>

            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* 円形グリッド（背景） */}
          <g>
            {gridLevels.map((level) => (
              <circle
                key={`circle-${level}`}
                cx={center}
                cy={center}
                r={radius * (level / 5)}
                className="chart-grid-circle"
              />
            ))}
          </g>

          {/* 三角形グリッド */}
          <g>
            {gridLevels.map((level) => (
              <polygon
                key={`triangle-${level}`}
                points={`${getPoint(angles.salary, radius * (level / 5)).x},${getPoint(angles.salary, radius * (level / 5)).y} ${getPoint(angles.holidays, radius * (level / 5)).x},${getPoint(angles.holidays, radius * (level / 5)).y} ${getPoint(angles.employees, radius * (level / 5)).x},${getPoint(angles.employees, radius * (level / 5)).y}`}
                className="chart-grid-triangle"
              />
            ))}
          </g>

          {/* 軸線 */}
          <g>
            <line
              x1={center}
              y1={center}
              x2={getPoint(angles.salary, radius).x}
              y2={getPoint(angles.salary, radius).y}
              className="chart-axis"
            />
            <line
              x1={center}
              y1={center}
              x2={getPoint(angles.holidays, radius).x}
              y2={getPoint(angles.holidays, radius).y}
              className="chart-axis"
            />
            <line
              x1={center}
              y1={center}
              x2={getPoint(angles.employees, radius).x}
              y2={getPoint(angles.employees, radius).y}
              className="chart-axis"
            />
          </g>

          {/* 目盛り */}
          <g>
            {gridLevels.map((level) => (
              <g key={`ticks-${level}`}>
                {/* 給与軸の目盛り */}
                <line
                  x1={getPoint(angles.salary, radius * (level / 5)).x - 3}
                  y1={getPoint(angles.salary, radius * (level / 5)).y}
                  x2={getPoint(angles.salary, radius * (level / 5)).x + 3}
                  y2={getPoint(angles.salary, radius * (level / 5)).y}
                  className="chart-tick"
                />
                <text
                  x={getPoint(angles.salary, radius * (level / 5)).x + 12}
                  y={getPoint(angles.salary, radius * (level / 5)).y + 3}
                  className="tick-label"
                >
                  {level}
                </text>

                {/* 休日軸の目盛り */}
                <line
                  x1={getPoint(angles.holidays, radius * (level / 5)).x}
                  y1={getPoint(angles.holidays, radius * (level / 5)).y - 3}
                  x2={getPoint(angles.holidays, radius * (level / 5)).x}
                  y2={getPoint(angles.holidays, radius * (level / 5)).y + 3}
                  className="chart-tick"
                  transform={`rotate(60 ${getPoint(angles.holidays, radius * (level / 5)).x} ${getPoint(angles.holidays, radius * (level / 5)).y})`}
                />
                <text
                  x={getPoint(angles.holidays, radius * (level / 5)).x - 12}
                  y={getPoint(angles.holidays, radius * (level / 5)).y + 3}
                  className="tick-label"
                >
                  {level}
                </text>

                {/* 規模軸の目盛り */}
                <line
                  x1={getPoint(angles.employees, radius * (level / 5)).x}
                  y1={getPoint(angles.employees, radius * (level / 5)).y - 3}
                  x2={getPoint(angles.employees, radius * (level / 5)).x}
                  y2={getPoint(angles.employees, radius * (level / 5)).y + 3}
                  className="chart-tick"
                  transform={`rotate(-60 ${getPoint(angles.employees, radius * (level / 5)).x} ${getPoint(angles.employees, radius * (level / 5)).y})`}
                />
                <text
                  x={getPoint(angles.employees, radius * (level / 5)).x + 12}
                  y={getPoint(angles.employees, radius * (level / 5)).y + 3}
                  className="tick-label"
                >
                  {level}
                </text>
              </g>
            ))}
          </g>

          {/* データエリア - 3つのグラデーションを重ねる */}
          <g className="chart-area-group">
            <polygon 
              points={polygonPoints} 
              className="chart-area"
              fill="url(#salaryGradient)"
              style={{ opacity: 0.8 }}
            />
            <polygon 
              points={polygonPoints} 
              className="chart-area"
              fill="url(#holidaysGradient)"
              style={{ opacity: 0.6, mixBlendMode: 'multiply' }}
            />
            <polygon 
              points={polygonPoints} 
              className="chart-area"
              fill="url(#employeesGradient)"
              style={{ opacity: 0.6, mixBlendMode: 'multiply' }}
            />
          </g>

          {/* データの輪郭 */}
          <polygon 
            points={polygonPoints} 
            className="chart-border"
            stroke="#4682B4"
            fill="none"
          />

          {/* データポイント */}
          <circle 
            cx={dataPoints.salary.x} 
            cy={dataPoints.salary.y} 
            r="6" 
            className="chart-point" 
            fill={pointColors.salary}
            filter="url(#softGlow)" 
          />
          <circle 
            cx={dataPoints.holidays.x} 
            cy={dataPoints.holidays.y} 
            r="6" 
            className="chart-point" 
            fill={pointColors.holidays}
            filter="url(#softGlow)" 
          />
          <circle 
            cx={dataPoints.employees.x} 
            cy={dataPoints.employees.y} 
            r="6" 
            className="chart-point" 
            fill={pointColors.employees}
            filter="url(#softGlow)" 
          />

          {/* ラベル */}
          <text x={center} y={getPoint(angles.salary, labelRadius).y - 5} className="chart-label">給与</text>
          <text x={getPoint(angles.holidays, labelRadius).x} y={getPoint(angles.holidays, labelRadius).y} className="chart-label label-left">休日</text>
          <text x={getPoint(angles.employees, labelRadius).x} y={getPoint(angles.employees, labelRadius).y} className="chart-label label-right">規模</text>

          {/* 評価スコア表示 */}
          <text x={center} y={getPoint(angles.salary, labelRadius).y + 10} className="score-label">
            {ratings.salary}/5
          </text>
          <text x={getPoint(angles.holidays, labelRadius).x - 5} y={getPoint(angles.holidays, labelRadius).y + 15} className="score-label">
            {ratings.holidays}/5
          </text>
          <text x={getPoint(angles.employees, labelRadius).x + 5} y={getPoint(angles.employees, labelRadius).y + 15} className="score-label">
            {ratings.employees}/5
          </text>
        </svg>
      </div>

      {/* 魅力点表示 */}
      <div 
        className="attraction-score"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = attractionScoreColor + '40';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        <div className="attraction-score-label">総合魅力度</div>
        <div className="attraction-score-content">
          <span 
            className="attraction-score-value"
            style={{ 
              color: attractionScoreColor
            }}
          >
            {attractionScore}
          </span>
          <span className="attraction-score-suffix">/ 5.0</span>
        </div>
        <div className="attraction-score-stars">
          {renderStars()}
        </div>
      </div>

      {/* 非公開データの注意書き */}
      {noteMessages.length > 0 && (
        <div className="chart-note">
          {noteMessages.map((message, index) => (
            <div key={index} className="chart-note-item">
              ※ {message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};