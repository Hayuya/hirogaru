import liff from '@line/liff';
import type { AuthState } from '../types/auth';

const LIFF_ID = import.meta.env.VITE_LIFF_ID;

class AuthManager {
  private authState: AuthState = {
    isInitialized: false,
    isLoggedIn: false,
    user: null,
    lineUserId: null,
    isFriend: false, // <-- 初期値を追加
  };

  async initialize(): Promise<AuthState> {
    if (!LIFF_ID) {
      console.error('LIFF Error: VITE_LIFF_IDが設定されていません。');
      return this.authState;
    }

    try {
      await liff.init({ liffId: LIFF_ID });
      this.authState.isInitialized = true;
      
      if (liff.isLoggedIn()) {
        this.authState.isLoggedIn = true;
        
        // ユーザープロフィールと友だち関係を並行して取得
        const [profile, friendship] = await Promise.all([
          liff.getProfile(),
          liff.getFriendship(),
        ]);

        // プロフィール情報をstateに保存
        this.authState.user = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        };
        this.authState.lineUserId = profile.userId;

        // ▼▼▼ ここから追加 ▼▼▼
        // 友だち関係をstateに保存
        if (friendship.friendFlag) {
          console.log('✅ ユーザーは公式アカウントの友だちです。');
          this.authState.isFriend = true;
        } else {
          console.log('ユーザーはまだ友だちではありません。');
          this.authState.isFriend = false;
        }
        // ▲▲▲ ここまで追加 ▲▲▲
        
      } else {
        this.authState.isLoggedIn = false;
      }
    } catch (error) {
      console.error('LIFF Error: 初期化または情報取得に失敗しました。', error);
    }
    
    return this.authState;
  }
}

export const authManager = new AuthManager();