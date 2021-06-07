import { ObjectLiteral } from 'typeorm';
import { validate } from 'class-validator';
import { ErrBase, ResException } from './error';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { Alias } from '../type';
import $EntityFieldsNames = Alias.$EntityFieldsNames;

export const $val = async (entity: ObjectLiteral, data: ObjectLiteral) => {
  const errors = await validate(Object.assign(entity, data));
  if (errors.length > 0) {
    throw new ResException(
      ErrBase.参数类型错误,
      errors.map((i) => i.property + '类型错误'),
    );
  }
  return entity;
};

export const listParams = <T>(opt: {
  pageSize?: string;
  page?: string;
  orderby?: Alias.OrderBy;
  orderKey?: $EntityFieldsNames<T>;
  orderList?: $EntityFieldsNames<T>[];
}): FindManyOptions<T> => {
  const $pageSize = parseInt(opt.pageSize);
  const $$pageSize = isNaN($pageSize) ? 10 : $pageSize;
  const pageSize = [10, 30, 50, 100].includes($$pageSize) ? $$pageSize : 10;
  const $page = parseInt(opt.page);
  const page = isNaN($page) ? 0 : $page;
  const {
    orderby = Alias.OrderBy.DESC,
    orderKey = 'id',
    orderList = ['id'],
  } = opt;
  const order: { [P in $EntityFieldsNames<T>]?: Alias.OrderBy } = {};
  if (orderList.concat(['id', 'created', 'updated']).includes(orderKey)) {
    order[orderKey] = [Alias.OrderBy.ASC, Alias.OrderBy.DESC].includes(orderby)
      ? orderby
      : Alias.OrderBy.DESC;
  }
  return {
    take: pageSize,
    skip: page * pageSize,
    order,
  };
};
