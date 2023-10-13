import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetRawHeaders = createParamDecorator(
  (data: string, cx: ExecutionContext) => {
    const req = cx.switchToHttp().getRequest();
    const rawHedears: string[] = req.rawHeaders;
    if (!rawHedears) {
      throw new InternalServerErrorException('rawHedears not found (request)');
    }

    return data ? rawHedears.filter((val) => val === data) : rawHedears;
  },
);
