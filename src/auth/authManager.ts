import liff from '@line/liff';
import type { AuthState } from '../types/auth';
import { logLineAction } from '../api/lineActionApi';

const LIFF_ID = import.meta.env.VITE_LIFF_ID;

class AuthManager {
  private authState: AuthState = {
    isInitialized: false,
    isLoggedIn: false,
    user: null,
    lineUserId: null,
    isFriend: false,
    error: null,
  };

  private isActionLogged = false; // アクションログが送信済みか管理するフラグ

  // 初期化処理を一度だけ実行することを保証する
  async initialize(): Promise<AuthState> {
    if (this.authState.isInitialized) {
      return this.authState;
    }

    if (!LIFF_ID) {
      this.authState.error = 'LIFF IDが設定されていません。';
      this.authState.isInitialized = true;
      return this.authState;
    }

    try {
      await liff.init({ liffId: LIFF_ID });
      
      if (liff.isLoggedIn()) {
        this.authState.isLoggedIn = true;
        
        const [profile, friendship] = await Promise.all([
          liff.getProfile(),
          liff.getFriendship(),
        ]);

        this.authState.user = profile;
        this.authState.lineUserId = profile.userId;
        this.authState.isFriend = friendship.friendFlag;

        // ユーザーIDが取得でき、かつまだログが送信されていなければ実行
        if (profile.userId && !this.isActionLogged) {
          // awaitをつけず非同期で実行し、UI表示をブロックしない
          logLineAction({
            lineUserId: profile.userId,
            actionName: 'RichMenuClick',
          });
          this.isActionLogged = true; // 送信済みフラグを立てる
        }
      }
    } catch (error) {
      console.error('LIFF Error:', error);
      this.authState.error = 'LIFFの初期化に失敗しました。時間をおいて再度お試しください。';
    } finally {
      this.authState.isInitialized = true; // 成功・失敗に関わらず初期化完了とする
    }
    
    return this.authState;
  }
}

// シングルトンインスタンスとしてエクスポート
export const authManager = new AuthManager();