export enum CacheType {
  video,
  up,
}
export const cacheName = (type: CacheType, key: string | number) =>
  [CacheType[type], key].join(':');
