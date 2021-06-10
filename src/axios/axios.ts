import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PRes, Type } from 'src/type';
import axiosRetry from 'axios-retry';
import { errorLog } from '../log4js/log';
import { MagicNumber } from '../util/magicNumber';

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
    this.axiosInstance.interceptors.request.use(async (req) => {
      const cookie =
        "_uuid=1C7AA815-2BE3-2FD5-2F27-0A6CE36B579397591infoc; buvid3=99386200-1DE0-4D40-AEAA-5DB025952B70143079infoc; sid=lx53ui2n; fingerprint=51936f1d8205f677566b7ff40a403d47; CURRENT_FNVAL=80; blackside_state=1; CURRENT_QUALITY=120; rpdid=|(umYR)|JuJR0J'uYumu~uRmR; buvid_fp_plain=3DBE2F24-550A-B4C3-139B-8143C46CFE7656853infoc; DedeUserID=5213161; DedeUserID__ckMd5=426a9e940246e7aa; SESSDATA=23af0a8d%2C1635235928%2Cefe78*41; bili_jct=1fc58a4717dcff0b68eefdc7cb1d5767; bsource=search_baidu; LIVE_BUVID=AUTO3616210005492248; bp_video_offset_5213161=524672775390779107; bp_t_offset_5213161=524680609406987779; PVID=3";
      // (await $redis.str.get(['bilibili', 'cookie'].join(':')))[1] || '';
      req.headers = {
        ...req.headers,
        cookie,
      };
      return req;
    });
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
