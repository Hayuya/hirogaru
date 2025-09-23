// LIFF関連の型定義
export interface LiffUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export interface AuthState {
  isInitialized: boolean;
  isLoggedIn: boolean;
  user: LiffUser | null;
  lineUserId: string | null;
}