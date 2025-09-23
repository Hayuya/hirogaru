import axios from 'axios';

// 開発環境ではViteのプロキシを経由するため相対パスを、
// 本番環境では環境変数に設定された絶対パスを使用する
const BASE_URL = import.meta.env.DEV 
  ? '/api/v1' 
  : import.meta.env.VITE_API_BASE_URL || 'https://test.hiroshima-shukatsu.site/api/v1';

// Axiosインスタンスの作成
export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// レスポンスインターセプター
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // サーバーからエラーレスポンスが返ってきた場合
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // リクエストが送信されたが、レスポンスがない場合
      console.error('Network Error:', error.message);
    } else {
      // その他のエラー
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);