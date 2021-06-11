import log4js from 'log4js';
import { Type } from '../type';

export const logInit = () =>
  log4js.configure({
    appenders: {
      error: { type: 'dateFile', filename: '/tmp/bilibili_log/error.log' },
    },
    categories: {
      error: { appenders: ['error'], level: 'error' },
      default: { appenders: ['error'], level: 'error' },
    },
  });

const errorHelper = (
  categories: 'api' | 'script' | 'mysql' | 'redis' | 'error' | 'lock',
  msg: Type.Obj<any> | string,
) => log4js.getLogger(categories).error(JSON.stringify(msg));

export const errorLog = (msg: Type.Obj<any> | string) => {
  errorHelper('error', msg);
  return errorLog;
};
