import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PRes, Type } from 'src/type';
import axiosRetry from 'axios-retry';
import { errorLog } from '../../log4js/log';
import { MagicNumber } from '../../util/magicNumber';

export default class NodeAxios {
  axiosInstance: AxiosInstance;
  private readonly options: AxiosRequestConfig;

  constructor(options: AxiosRequestConfig) {
    this.options = options;
    this.axiosInstance = Axios.create({ ...options });
    axiosRetry(this.axiosInstance, {
      retries: MagicNumber.AXIOS_RETRY,
      shouldResetTimeout: true,
      retryDelay: () => MagicNumber.AXIOS_RETRY_DELAY,
      retryCondition: (error) => {
        errorLog(error.config.url + ' retry');
        return true;
      },
    });
    this.interceptors();
  }

  interceptors() {
    this.axiosInstance.interceptors.response.use(
      (res) => {
        return res;
      },
      (err) => {
        return Promise.reject(err);
      },
    );
  }

  $ = async <T>(
    url: string,
    data?: Type.Obj<string | number | undefined>,
    opt?: AxiosRequestConfig,
  ): PRes<T> => {
    const { method = 'GET' } = opt || {};
    return new Promise((resolve) => {
      this.axiosInstance
        .request<T>({
          ...opt,
          url,
          method,
          params: method === 'GET' ? data : {},
          data: method !== 'GET' ? data : {},
        })
        .then((res) => resolve([null, res.data]))
        .catch((err) => resolve([err, null]));
    });
  };
}
