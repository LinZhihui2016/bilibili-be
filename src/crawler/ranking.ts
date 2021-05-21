import { BiliBiliApi } from './index';
import { api } from '../axios';
import { RankId } from '../modules/rank/rank.entity';

export interface Ranking {
  bvid: string;
  owner: {
    mid: number;
  };
}

export const apiRank = (rid: RankId) =>
  api.$<BiliBiliApi<{ list: Ranking[] }>>('web-interface/ranking/v2', {
    rid,
    type: 'all',
  });
