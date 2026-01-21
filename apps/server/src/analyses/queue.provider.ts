import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

export const analysisQueueProvider: Provider = {
  provide: 'ANALYSIS_QUEUE',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Queue('analysis', {
      connection: {
        host: configService.get<string>('REDIS_HOST'),
        port: Number(configService.get<number>('REDIS_PORT')),
      },
    });
  },
};
