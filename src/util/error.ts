import { isArr } from './arr';

export enum ErrBase {}

export type Err = ErrBase;

export class ResException extends Error {
  constructor(public code: Err, public msg: string | string[] = '') {
    super(isArr(msg).join(' | '));
  }
}
