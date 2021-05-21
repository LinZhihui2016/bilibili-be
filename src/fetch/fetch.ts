import fetch, { RequestInit } from 'node-fetch';
import qs from 'qs';
import { PRes, Type } from 'src/type';

export class NodeFetch {
  options: RequestInit;

  constructor(public baseUrl: string, options: RequestInit) {
    this.options = { headers: {}, ...options };
  }

  $ = async (
    url: string,
    data?: Type.Obj<string | number | undefined>,
    opt?: RequestInit,
  ): PRes<string> => {
    const { method = 'GET' } = opt || {};
    const u =
      this.baseUrl +
      '/' +
      url +
      (method === 'GET' ? '?' + qs.stringify(data) : '');
    const cookie =
      "_uuid=1C7AA815-2BE3-2FD5-2F27-0A6CE36B579397591infoc; buvid3=99386200-1DE0-4D40-AEAA-5DB025952B70143079infoc; sid=lx53ui2n; fingerprint=51936f1d8205f677566b7ff40a403d47; CURRENT_FNVAL=80; blackside_state=1; CURRENT_QUALITY=120; rpdid=|(umYR)|JuJR0J'uYumu~uRmR; buvid_fp_plain=3DBE2F24-550A-B4C3-139B-8143C46CFE7656853infoc; DedeUserID=5213161; DedeUserID__ckMd5=426a9e940246e7aa; SESSDATA=23af0a8d%2C1635235928%2Cefe78*41; bili_jct=1fc58a4717dcff0b68eefdc7cb1d5767; bsource=search_baidu; LIVE_BUVID=AUTO3616210005492248; bp_video_offset_5213161=524672775390779107; bp_t_offset_5213161=524680609406987779; PVID=3";

    // (await $redis.str.get(['bilibili', 'cookie'].join(':')))[1] || '';
    return new Promise((resolve) => {
      fetch(u, {
        ...this.options,
        ...opt,
        headers: {
          cookie,
        },
        method,
        body: method === 'GET' ? JSON.stringify(data) : undefined,
      })
        .then((res) => res.text().then((text) => resolve([null, text])))
        .catch((err) => resolve([err, null]));
    });
  };
}
