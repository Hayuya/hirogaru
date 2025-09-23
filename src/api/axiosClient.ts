import axios from 'axios';

// 開発モードではViteのプロキシを経由する相対パスを、本番環境では絶対パスを使用する
const BASE_URL = import.meta.env.DEV
  ? '/api/v1'
  : import.meta.env.VITE_API_BASE_URL;

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// エラーハンドリングを強化
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', 'No response received', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);