import { isArr } from './arr';
import { Err } from './error';

export interface ResBody {
  err: string;
  msg: string;
  time: string;
  data: any;
}

export class Res {
  constructor(
    public data = {},
    public msg: string[] | string = '',
    public err: number | number[] | string[] | string = 0,
  ) {}

  time: Date;

  json(): ResBody {
    const { data, msg, err } = this;
    return {
      data,
      time: new Date().toISOString(),
      msg: isArr(msg).filter(Boolean).join(' | '),
      err: isArr(err).filter(Boolean).join(' | '),
    };
  }

  error(err: Err, msg?: string | string[], data = null) {
    this.data = data;
    this.err = err;
    this.msg = isArr(msg || '')
      .filter(Boolean)
      .join('|');
    this.time = new Date();
    return this;
  }

  success(data: any) {
    this.data = data;
    this.err = 0;
    this.msg = '';
    this.time = new Date();
    return this;
  }
}

export const error = (err: Err, msg?: string | string[]) =>
  new Res().error(err, msg);
export const success = (data: any) => new Res().success(data);
