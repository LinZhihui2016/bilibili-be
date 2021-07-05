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
    return new Promise((resolve) => {
      fetch(u, {
        ...this.options,
        ...opt,
        method,
        body: method !== 'GET' ? JSON.stringify(data) : undefined,
      })
        .then((res) => res.text().then((text) => resolve([null, text])))
        .catch((err) => resolve([err, null]));
    });
  };
}
