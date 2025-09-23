import { axiosClient } from './axiosClient';

interface LogActionParams {
  lineUserId: string;
  actionName: string;
}

/**
 * LINEユーザーのアクションをサーバーに記録します。
 * @param params - lineUserIdとactionNameを含むオブジェクト
 */
export const logLineAction = async ({ lineUserId, actionName }: LogActionParams): Promise<void> => {
  try {
    // line_user_idをクエリパラメータとして付与
    const queryParams = new URLSearchParams({ line_user_id: lineUserId });
    
    // リクエストボディを作成
    const requestBody = {
      action_name: actionName,
    };

    await axiosClient.post(`/line/actions?${queryParams.toString()}`, requestBody);
    console.log(`✅ Action logged: ${actionName} for user: ${lineUserId}`);

  } catch (error) {
    // このAPI呼び出しの失敗がアプリケーション全体の動作を妨げないように、
    // エラーはコンソールに出力するだけに留めます。
    console.error('Failed to log LINE action:', error);
  }
};