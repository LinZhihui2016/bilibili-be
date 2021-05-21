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
