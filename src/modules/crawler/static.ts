import { AxiosRequestConfig } from 'axios';

export const AXIOS_OPTION: (
  baseURL: string,
  cookie?: string,
) => AxiosRequestConfig = (baseURL: string, cookie?: string) => ({
  baseURL,
  headers: {
    cookie,
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  },
  withCredentials: true,
  timeout: 30000,
});
