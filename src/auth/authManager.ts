import liff from '@line/liff';
import type { AuthState } from '../types/auth';
import { logLineAction } from '../api/lineActionApi';

const LIFF_ID = import.meta.env.VITE_LIFF_ID;

// セッション内でトラッキングが一度だけ実行されたか管理するフラグ
let isActionLogged = false;

class AuthManager {
  private authState: AuthState = {
    isInitialized: false,
    isLoggedIn: false,
    user: null,
    lineUserId: null,
    isFriend: false,
    error: null,
  };

  async initialize(): Promise<AuthState> {
    // 既に初期化済みの場合は、現在の状態をそのまま返す
    if (this.authState.isInitialized) {
      return this.authState;
    }

    if (!LIFF_ID) {
      console.error('LIFF Error: VITE_LIFF_IDが設定されていません。');
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

        // ▼▼▼ ここから修正 ▼▼▼
        // セッション内で一度もログが送信されていなければ、トラッキングAPIを呼び出す
        if (profile.userId && !isActionLogged) {
          // ログ送信処理を実行
          logLineAction({
            lineUserId: profile.userId,
            actionName: 'RichMenuClick',
          });
          // 送信済みフラグを立てる
          isActionLogged = true;
        }
        // ▲▲▲ ここまで修正 ▲▲▲

        if (friendship.friendFlag) {
          this.authState.isFriend = true;
        } else {
          this.authState.isFriend = false;
        }
        
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