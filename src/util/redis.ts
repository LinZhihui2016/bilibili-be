export enum CacheType {
  video,
  up,
}
export const cacheName = (type: CacheType, key: string | number) =>
  [CacheType[type], key].join(':');

export const pageParams = <T>(
  arr: T[],
  opt: { pageSize: string; page: string },
) => {
  const $pageSize = parseInt(opt.pageSize);
  const $$pageSize = isNaN($pageSize) ? 10 : $pageSize;
  const pageSize = [10, 30, 50, 100].includes($$pageSize) ? $$pageSize : 10;
  const $page = parseInt(opt.page);
  const page = isNaN($page) ? 0 : $page;
  return arr.slice(page * pageSize, (page + 1) * pageSize);
};
