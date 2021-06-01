import { Err } from '../util/error';
import { EntityFieldsNames } from 'typeorm/common/EntityFieldsNames';
import { $BaseEntity } from '../util/entity';

export namespace Type {
  export interface Obj<T = string | number> {
    [key: string]: T | undefined;
  }
}

export namespace Alias {
  export enum OrderBy {
    DESC = 'DESC',
    ASC = 'ASC',
  }
  export type $EntityFieldsNames<T> = EntityFieldsNames<T> | keyof $BaseEntity;
}

export type PRes<T, E = Err> = Promise<[null, T] | [E, null]>;
