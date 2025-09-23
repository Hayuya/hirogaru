import liff from '@line/liff';
import type { AuthState } from '../types/auth';

// LIFF IDを環境変数から取得
const LIFF_ID = import.meta.env.VITE_LIFF_ID || '2008160071-7jkwxNXd';
// 開発モードフラグ
const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === 'false';

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
        isLoggedIn: false,
        user: null,
        lineUserId: null,
      };
      return this.authState;
    }

    try {
      await liff.init({ liffId: LIFF_ID });
      this.authState.isInitialized = true;
      
      // ログイン状態の確認
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
          // プロフィール取得に失敗してもユーザーIDだけは設定を試みる
          const context = liff.getContext();
          if (context?.userId) {
            this.authState.lineUserId = context.userId;
          }
        }
      }
      // 自動ログインは削除 - ユーザーが明示的にログインボタンをクリックした時のみログイン
    } catch (error) {
      console.error('LIFF initialization failed:', error);
      // エラーが発生してもアプリは続行
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

  // ログイン実行
  login(): void {
    if (IS_DEV_MODE) {
      // 開発モードではモックユーザーでログイン
      console.log('🔧 開発モード: モックユーザーでログイン');
      this.authState.isLoggedIn = true;
      this.authState.user = {
        userId: 'U76a571a8946f918db4a80e959a579ac1',
        displayName: 'テストユーザー',
        pictureUrl: 'https://via.placeholder.com/100',
      };
      this.authState.lineUserId = 'U76a571a8946f918db4a80e959a579ac1';
      // ページをリロードして状態を反映
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
      // 開発モードではローカルストレージをクリア
      console.log('🔧 開発モード: ログアウト');
      this.authState.isLoggedIn = false;
      this.authState.user = null;
      this.authState.lineUserId = null;
      // ページをリロードして状態を反映
      window.location.reload();
      return;
    }

    if (liff.isLoggedIn()) {
      liff.logout();
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