import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { JobStatus, Queue } from 'bull';
import { JobData, JobType } from '../../jobs/job.type';

@Injectable()
export class AdminService {
  constructor(@InjectQueue('job') private jobQueue: Queue<JobData>) {}

  static pageParams<T>(arr: T[], opt: { pageSize: string; page: string }) {
    const $pageSize = parseInt(opt.pageSize);
    const $$pageSize = isNaN($pageSize) ? 10 : $pageSize;
    const pageSize = [10, 30, 50, 100].includes($$pageSize) ? $$pageSize : 10;
    const $page = parseInt(opt.page);
    const page = isNaN($page) ? 0 : $page;
    return arr.slice(page * pageSize, (page + 1) * pageSize);
  }

  async getList(statusArr: JobStatus[], typeArr: JobType[], page, pageSize) {
    const list = await this.jobQueue.getJobs(statusArr);
    const $listFilterByType = list
      .filter((i) => {
        const { type } = i.data;
        return typeArr.includes(type);
      })
      .map(({ data, finishedOn, timestamp, id, failedReason }) => {
        let state: string;
        const setState = (v: string) => (state = v);
        if (finishedOn && failedReason) setState('fail');
        if (finishedOn && !failedReason) setState('completed');
        if (!finishedOn) setState('waiting');
        return {
          ...data,
          finishedOn,
          timestamp,
          id,
          failedReason,
          state,
        };
      });
    return {
      list: AdminService.pageParams($listFilterByType, { page, pageSize }),
      count: $listFilterByType.length,
    };
  }
}
