import { isArr } from './arr';
import { errorLog } from '../log4js/log';

export enum ErrBase {
  参数类型错误 = 1,
}

export type Err = ErrBase;

export class ResException extends Error {
  constructor(public code: Err, public msg: string | string[] = '') {
    super(isArr(msg).join(' | '));
    errorLog(isArr(msg).join(' | '));
  }
}
