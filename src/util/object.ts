import { ObjectLiteral } from 'typeorm';

export const objectFlat = (
  obj: ObjectLiteral,
  key: string,
  keys: string[],
  delKey = true,
) => {
  const tar = obj[key];
  keys.forEach((k) => {
    if (tar.hasOwnProperty(k)) {
      obj[key + '_' + k] = tar[k];
    }
  });
  delKey && delete obj[key];
  return obj;
};

export const arrFlat = (
  arr: ObjectLiteral[],
  key: string,
  keys: string[],
  delKey = true,
) => {
  arr.forEach((item) => objectFlat(item, key, keys, delKey));
  return arr;
};
