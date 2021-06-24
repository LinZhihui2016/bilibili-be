export interface BiliBiliApi<T> {
  code: 0 | -404;
  data: T;
  ttl: 1;
  message: string;
}
