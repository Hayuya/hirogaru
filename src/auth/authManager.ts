import liff from '@line/liff';
import type { AuthState } from '../types/auth';

// LIFF IDを環境変数から取得します。
const LIFF_ID = import.meta.env.VITE_LIFF_ID;

class AuthManager {
  private authState: AuthState = {
    isInitialized: false,
    isLoggedIn: false,
    user: null,
    lineUserId: null,
  };

  /**
   * LIFFの初期化とユーザーの自動識別
   */
  async initialize(): Promise<AuthState> {
    // LIFF IDが設定されていない場合は処理を中断します。
    if (!LIFF_ID) {
      console.error('LIFF Error: LIFF IDが設定されていません。');
      return this.authState;
    }

    try {
      // LIFF SDKを初期化
      await liff.init({ liffId: LIFF_ID });
      this.authState.isInitialized = true;
      
      // ユーザーがLINEにログインしているか（LINEアプリ内で閲覧しているか）を確認します。
      if (liff.isLoggedIn()) {
        this.authState.isLoggedIn = true;
        
        try {
          // ユーザーのプロフィール情報を取得します。
          const profile = await liff.getProfile();
          this.authState.user = {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
          };
          // バックエンドAPIに渡すためのLINEユーザーIDをstateに保存します。
          this.authState.lineUserId = profile.userId;
        } catch (error) {
          console.error('LIFF Error: プロフィールの取得に失敗しました。', error);
          // 予備としてコンテキストからユーザーIDの取得を試みます。
          const context = liff.getContext();
          if (context?.userId) {
            this.authState.lineUserId = context.userId;
          }
        }
      } else {
        // PCのブラウザなど、LINE環境外からのアクセスの場合は「未ログイン」状態となります。
        this.authState.isLoggedIn = false;
      }
    } catch (error) {
      console.error('LIFF Error: 初期化に失敗しました。', error);
    }
    
    return this.authState;
  }
}

export const authManager = new AuthManager();