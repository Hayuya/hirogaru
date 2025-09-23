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
  
  // セッション内でのトラッキング重複を防ぐフラグをクラス変数に変更
  private isActionLogged = false;

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

        this.authState.user = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        };
        this.authState.lineUserId = profile.userId;

        // ユーザーIDが取得でき、かつまだログが送信されていなければ実行
        if (profile.userId && !this.isActionLogged) {
          // トラッキングAPIを呼び出す
          logLineAction({
            lineUserId: profile.userId,
            actionName: 'RichMenuClick',
          });
          // 送信済みフラグを立てる
          this.isActionLogged = true;
        }

        this.authState.isFriend = friendship.friendFlag;
        
      } else {
        this.authState.isLoggedIn = false;
      }
    } catch (error) {
      console.error('LIFF Error: 初期化または情報取得に失敗しました。', error);
      this.authState.error = 'LIFFの初期化に失敗しました。時間をおいて再度お試しください。';
    } finally {
      this.authState.isInitialized = true;
    }
    
    return this.authState;
  }
}

export const authManager = new AuthManager();