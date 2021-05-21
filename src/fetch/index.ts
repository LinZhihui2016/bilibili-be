import { NodeFetch } from './fetch';

export const video = new NodeFetch('https://www.bilibili.com/video', {
  method: 'GET',
});
