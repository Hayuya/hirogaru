// 企業情報の型定義
export interface Company {
  rank: number;
  company_name: string;
  industry: string;
  rating: number;
  employee_reviews_count: number;
  starting_salary_graduates: string;
  annual_holidays: number;
  average_overtime_hours: number;
  paid_leave_usage_rate: number;
  work_location: string;
  relocation: string;
  bonus_frequency_timing: string;
  bonus_previous_year_result: string;
  housing_allowance: boolean;
  meal_subsidy: string;
  special_leave: boolean;
  qualification_support: boolean;
  company_overview_120: string;
  headquarters_address: string;
  number_of_employees: number;
  main_business_products: string;
  revenue: string;
  strengths_unique_points: string;
  future_prospects: string;
  job_openings_excerpt: string;
  average_years_of_service: number;
  average_age: number;
  gender_ratio: string;
  official_website_url: string;
  recruitment_page_url: string;
  reference_url_recruitment: string;
  reference_url_open_work: string;
  reference_url_mynavi_rikunavi: string;
  id: string;
  created_at: string;
  updated_at: string;
  // 新しいプロパティ
  fixed_overtime_system: boolean;
  fixed_overtime_allowance: string; //
  base_salary: string;
  average_paid_leave_days: number | null;
  remote_work: boolean;
  flextime: boolean;
}

// ソート項目の定義
export type SortOption =
  | 'starting_salary_graduates'
  | 'revenue'
  | 'number_of_employees'
  | 'average_overtime_hours'
  | 'average_years_of_service'
  | 'average_age';

// フィルター項目の定義
export interface FilterOptions {
  industries: string[];
  hasWelfareOver30: boolean;
  femaleRatioOver30: boolean;
}

// 業界カテゴリの定義
export const INDUSTRIES = [
  '第一次産業（資源・素材）',
  '製造業',
  '建設・不動産業',
  'インフラ・運輸業',
  '情報通信業',
  '商業（卸売・小売業）',
  '金融・保険業',
  '専門サービス業',
  '生活・娯楽サービス業',
  '医療・福祉・教育産業'
] as const;

export type Industry = typeof INDUSTRIES[number];