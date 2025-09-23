import liff from '@line/liff';
import type { AuthState } from '../types/auth';

// LIFF IDを環境変数から取得
const LIFF_ID = import.meta.env.VITE_LIFF_ID || '2008160071-7jkwxNXd';
// 開発モードフラグ (ローカル環境での動作を模擬します)
const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

class AuthManager {
  private authState: AuthState = {
    isInitialized: false,
    isLoggedIn: false,
    user: null,
    lineUserId: null,
  };

  /**
   * LIFFの初期化と自動ログイン処理
   */
  async initialize(): Promise<AuthState> {
    // 開発モードが有効な場合、LIFFの通信を行わず模擬データを使用します
    if (IS_DEV_MODE) {
      console.log('🔧 開発モード: 模擬ユーザーでログイン状態を再現します。');
      this.authState = {
        isInitialized: true,
        isLoggedIn: true,
        user: {
          userId: 'U_DEV_MOCK_USER_ID',
          displayName: '開発用ユーザー',
          pictureUrl: 'https://via.placeholder.com/100',
        },
        lineUserId: 'U_DEV_MOCK_USER_ID',
      };
      return this.authState;
    }

    try {
      // LIFF SDKを初期化
      await liff.init({ liffId: LIFF_ID });
      this.authState.isInitialized = true;
      
      // ユーザーがLINEにログインしているかを確認します。
      // LINEアプリ内のブラウザ（リッチメニューからのアクセスなど）であれば、ここは `true` になります。
      if (liff.isLoggedIn()) {
        console.log('✅ LIFF: ログイン状態を確認しました。');
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
          console.log(`👤 ユーザーID: ${profile.userId} を取得しました。`);
        } catch (error) {
          console.error('LIFF Error: プロフィールの取得に失敗しました。', error);
          // プロフィール取得に失敗した場合でも、コンテキストからユーザーIDの取得を試みます。
          const context = liff.getContext();
          if (context?.userId) {
            this.authState.lineUserId = context.userId;
          }
        }
      } else {
        // ユーザーがLINEにログインしていない場合（例：PCのブラウザでURLを直接開いた場合など）
        // 何もせず「未ログイン」状態として処理を続行します。
        console.log('ユーザーは未ログイン状態です。');
        this.authState.isLoggedIn = false;
      }
    } catch (error) {
      console.error('LIFF Error: 初期化に失敗しました。', error);
      this.authState.isInitialized = false;
    }
    
    return this.authState;
  }

  // UIからログインボタンが削除されたため、手動ログイン・ログアウト処理は不要になりました。
  // 必要であれば再度実装しますが、現状の要件ではこれらのメソッドは使用されません。
}

export const authManager = new AuthManager();