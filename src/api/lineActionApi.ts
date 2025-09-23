import { axiosClient } from './axiosClient';

interface LogActionParams {
  lineUserId: string;
  actionName: string;
}

/**
 * LINEユーザーのアクションをサーバーに記録します。
 * この処理の失敗がアプリ全体の動作に影響を与えないように、エラーはコンソールに出力するのみとします。
 * @param params lineUserIdとactionName
 */
export const logLineAction = async ({ lineUserId, actionName }: LogActionParams): Promise<void> => {
  try {
    const queryParams = new URLSearchParams({ line_user_id: lineUserId });
    const requestBody = { action_name: actionName };
    
    await axiosClient.post(`/line/actions?${queryParams.toString()}`, requestBody);
    console.log(`✅ Action logged: ${actionName} for user ${lineUserId}`);
  } catch (error) {
    console.error('Failed to log LINE action:', error);
  }
};