import { axiosClient } from './axiosClient';
import type { Company } from '../types/company';

// line_user_idのみを受け取るように変更
interface CompaniesParams {
  line_user_id?: string | null;
}

// 企業一覧を取得（全件取得）
export const fetchCompanies = async (params: CompaniesParams): Promise<Company[]> => {
  try {
    // パラメータをシンプルにし、line_user_idのみを付与
    const queryParams = new URLSearchParams();
    if (params.line_user_id) {
      queryParams.append('line_user_id', params.line_user_id);
    }
    
    // フィルターやソート関連のパラメータを削除
    const response = await axiosClient.get<Company[]>(`/companies?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    throw error;
  }
};

// 企業詳細を取得（変更なし）
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