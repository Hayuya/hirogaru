import { axiosClient } from './axiosClient';
import type { Company, SortOption } from '../types/company';

interface CompaniesParams {
  skip?: number;
  limit?: number;
  line_user_id?: string | null;
  sort?: SortOption;
  order?: 'asc' | 'desc';
  industry?: string;
  female_ratio_over_30?: boolean;
  relocation_none?: boolean; // 「転勤なし」フィルターを追加
  has_special_leave?: boolean; // 「特別休暇あり」フィルターを追加
  has_housing_allowance?: boolean; // 「住宅手当あり」フィルターを追加
}

// 企業一覧を取得
export const fetchCompanies = async (params: CompaniesParams): Promise<Company[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    // 基本パラメータ
    queryParams.append('skip', (params.skip || 0).toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.line_user_id) queryParams.append('line_user_id', params.line_user_id);
    
    // ソート関連
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);
    
    // フィルター関連
    if (params.industry) queryParams.append('industry', params.industry);
    if (params.female_ratio_over_30 !== undefined) {
      queryParams.append('female_ratio_over_30', params.female_ratio_over_30.toString());
    }
    // 新しい福利厚生フィルターをクエリパラメータに追加
    if (params.relocation_none !== undefined) {
      queryParams.append('relocation_none', params.relocation_none.toString());
    }
    if (params.has_special_leave !== undefined) {
      queryParams.append('has_special_leave', params.has_special_leave.toString());
    }
    if (params.has_housing_allowance !== undefined) {
      queryParams.append('has_housing_allowance', params.has_housing_allowance.toString());
    }
    
    const response = await axiosClient.get<Company[]>(`/companies?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    throw error;
  }
};

// 企業詳細を取得（必要に応じて実装）
export const fetchCompanyDetail = async (id: string, lineUserId?: string | null): Promise<Company> => {
  try {
    const params = lineUserId ? `?line_user_id=${lineUserId}` : '';
    const response = await axiosClient.get<Company>(`/companies/${id}${params}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch company detail:', error);
    throw error;
  }
};