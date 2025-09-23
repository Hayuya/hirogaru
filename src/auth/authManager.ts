import liff from '@line/liff';
import type { AuthState } from '../types/auth';

// LIFF IDを環境変数から取得
const LIFF_ID = import.meta.env.VITE_LIFF_ID || '2008160071-7jkwxNXd';
// 開発モードフラグ
const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'; // 文字列'true'と比較

class AuthManager {
  private authState: AuthState = {
    isInitialized: false,
    isLoggedIn: false,
    user: null,
    lineUserId: null,
  };

  // LIFF初期化
  async initialize(): Promise<AuthState> {
    // 開発モード時はモックデータを返す
    if (IS_DEV_MODE) {
      console.log('🔧 開発モード: LIFFをモックで動作');
      this.authState = {
        isInitialized: true,
        isLoggedIn: true, // 開発モードでもログイン状態にする
        user: {
          userId: 'U_DEV_USER_ID_12345',
          displayName: '開発用ユーザー',
          pictureUrl: 'https://via.placeholder.com/100',
        },
        lineUserId: 'U_DEV_USER_ID_12345',
      };
      return this.authState;
    }

    try {
      await liff.init({ liffId: LIFF_ID });
      this.authState.isInitialized = true;
      
      // ▼▼▼ ここから変更 ▼▼▼
      // ログイン状態を確認し、未ログインなら自動でログインを実行
      if (liff.isLoggedIn()) {
        this.authState.isLoggedIn = true;
        
        // プロフィール情報の取得
        try {
          const profile = await liff.getProfile();
          this.authState.user = {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
          };
          this.authState.lineUserId = profile.userId;
        } catch (error) {
          console.error('Failed to get profile:', error);
          const context = liff.getContext();
          if (context?.userId) {
            this.authState.lineUserId = context.userId;
          }
        }
      } else {
        // 未ログインの場合は、LINEログイン画面にリダイレクトしてログインを促す
        liff.login();
      }
      // ▲▲▲ ここまで変更 ▲▲▲

    } catch (error) {
      console.error('LIFF initialization failed:', error);
    }
    
    return this.authState;
  }

  // 現在の認証状態を取得
  getAuthState(): AuthState {
    return this.authState;
  }

  // ユーザーIDを取得
  getLineUserId(): string | null {
    return this.authState.lineUserId;
  }

  // ログイン状態を確認
  isLoggedIn(): boolean {
    return this.authState.isLoggedIn;
  }

  // ログイン実行（手動ログイン用として残すが、今回は使われない）
  login(): void {
    if (IS_DEV_MODE) {
      console.log('🔧 開発モード: モックユーザーでログイン');
      window.location.reload();
      return;
    }

    if (!liff.isLoggedIn()) {
      liff.login();
    }
  }

  // ログアウト
  logout(): void {
    if (IS_DEV_MODE) {
      console.log('🔧 開発モード: ログアウト');
      // 開発モードでは実際にはログアウトしないため、リロードのみ
      window.location.reload();
      return;
    }

    if (liff.isLoggedIn()) {
      liff.logout();
      window.location.reload(); // ログアウト後にリロード
    }
  }

  // LIFFウィンドウを閉じる
  closeWindow(): void {
    if (IS_DEV_MODE) {
      console.log('🔧 開発モード: ウィンドウを閉じる（無効）');
      return;
    }
    liff.closeWindow();
  }

  // LINEアプリ内かどうかを確認
  isInClient(): boolean {
    if (IS_DEV_MODE) {
      return false;
    }
    return liff.isInClient();
  }
}

export const authManager = new AuthManager();