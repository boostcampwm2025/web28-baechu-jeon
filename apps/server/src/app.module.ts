import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { SseModule } from './sse/sse.module';
import { AnalysesModule } from './analyses/analyses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ProjectsModule,
    SseModule,
    AnalysesModule,
  ],
})
export class AppModule {}
