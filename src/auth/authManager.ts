import liff from '@line/liff';
import type { AuthState } from '../types/auth';
import { logLineAction } from '../api/lineActionApi'; // 作成したAPI関数をインポート

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

  async initialize(): Promise<AuthState> {
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

        // ▼▼▼ ここから追加 ▼▼▼
        // RichMenuClickアクションをサーバーに記録
        // 初期化処理をブロックしないように、awaitせず実行
        logLineAction({
          lineUserId: profile.userId,
          actionName: 'RichMenuClick',
        });
        // ▲▲▲ ここまで追加 ▲▲▲

        if (friendship.friendFlag) {
          console.log('✅ ユーザーは公式アカウントの友だちです。');
          this.authState.isFriend = true;
        } else {
          console.log('ユーザーはまだ友だちではありません。');
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