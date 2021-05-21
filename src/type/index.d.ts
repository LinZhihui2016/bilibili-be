import { Err } from '../util/error';

export namespace Type {
  export interface Obj<T = string | number> {
    [key: string]: T | undefined;
  }
}

export type PRes<T, E = Err> = Promise<[null, T] | [E, null]>;
