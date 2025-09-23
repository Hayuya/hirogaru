import axios from 'axios';

// 開発モード（DEV）の場合はプロキシを利用するため相対パスに、
// 本番ビルド（PROD）の場合は環境変数で指定された絶対パスに切り替える
const BASE_URL = import.meta.env.DEV
  ? '/api/v1'
  : import.meta.env.VITE_API_BASE_URL;

// Axiosインスタンスの作成
export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// レスポンスインターセプター (変更なし)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', 'The request was made but no response was received', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);