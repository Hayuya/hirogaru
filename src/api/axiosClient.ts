import axios from 'axios';

// 常に本番のAPIサーバーのベースURLを参照します。
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);