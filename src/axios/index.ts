import { AXIOS_OPTION } from './static';
import NodeAxios from './axios';

export const api = new NodeAxios(AXIOS_OPTION('https://api.bilibili.com/x'));
export const space = new NodeAxios(
  AXIOS_OPTION('https://space.bilibili.com/ajax'),
);
export const pgc = new NodeAxios(AXIOS_OPTION('https://api.bilibili.com/pgc'));
