import { axiosClient } from './axiosClient';
import type { LineUserDetail, CreateLineUserDetailPayload } from '../types/lineUserDetail';

export const getLineUserDetail = async (lineUserId: string): Promise<LineUserDetail | null> => {
  try {
    const response = await axiosClient.get<LineUserDetail>(
      `/line/user-details`,
      { params: { line_user_id: lineUserId } },
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createLineUserDetail = async (payload: CreateLineUserDetailPayload): Promise<void> => {
  await axiosClient.post('/line/user-details', payload);
};
