export const isArr = <T>(arr: T | T[]): T[] =>
  Array.isArray(arr) ? arr : [arr];

export const notInArr = <T>(arr: T[], key: T, init?: T) =>
  arr.includes(key) ? key : init === undefined ? arr[0] : init;
