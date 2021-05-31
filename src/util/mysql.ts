import { ObjectLiteral } from 'typeorm';
import { validate } from 'class-validator';
import { ErrBase, ResException } from './error';

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

export const initPagination = (opt: { pageSize?: string; page?: string }) => {
  const $pageSize = parseInt(opt.pageSize);
  const $$pageSize = isNaN($pageSize) ? 10 : $pageSize;
  const pageSize = [10, 30, 50, 100].includes($$pageSize) ? $$pageSize : 10;
  const $page = parseInt(opt.page);
  const page = isNaN($page) ? 1 : $page;
  return {
    take: pageSize,
    skip: (page - 1) * pageSize,
  };
};
