import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { AiModule } from './ai/ai.module';
import { BullModule } from '@nestjs/bullmq';
import { SseModule } from './sse/sse.module';
import { AnalysesModule } from './analyses/analyses.module';
import { VisualizationsModule } from './visualizations/visualizations.module';
import { PrismaModule } from './prisma/prisma.module';
import { IntentionsModule } from './intentions/intentions.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: Number(configService.get<string>('REDIS_PORT')),
        },
      }),
    }),

    DatabaseModule,
    StorageModule,
    ProjectsModule,
    IntentionsModule,
    AiModule,
    AnalysesModule,
    PrismaModule,
    SseModule,
    VisualizationsModule,
  ],
})
export class AppModule {}
