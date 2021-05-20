import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ResException } from '../util/error';
import { error } from '../util/json';
@Catch(ResException)
export class ResExceptionFilter implements ExceptionFilter<ResException> {
  catch(exception: ResException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.json(error(exception.code, exception.msg));
  }
}
