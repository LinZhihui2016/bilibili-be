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
      "_uuid=1C7AA815-2BE3-2FD5-2F27-0A6CE36B579397591infoc; buvid3=99386200-1DE0-4D40-AEAA-5DB025952B70143079infoc; sid=lx53ui2n; CURRENT_FNVAL=80; blackside_state=1; CURRENT_QUALITY=120; rpdid=|(umYR)|JuJR0J'uYumu~uRmR; DedeUserID=5213161; DedeUserID__ckMd5=426a9e940246e7aa; LIVE_BUVID=AUTO3616210005492248; PVID=3; fingerprint=088f67aa9191883b76eec15427f855e8; buvid_fp=99386200-1DE0-4D40-AEAA-5DB025952B70143079infoc; buvid_fp_plain=99386200-1DE0-4D40-AEAA-5DB025952B70143079infoc; fingerprint=4f2a498c8206764bc95e74e997544b0f; buvid_fp=99386200-1DE0-4D40-AEAA-5DB025952B70143079infoc; buvid_fp_plain=225D964D-74FB-4E92-9D01-BA998947256834755infoc; SESSDATA=0a0b6e83%2C1639810888%2C3b6c5*61; bili_jct=c9117882ef555511387a0ab64eebe308";

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
