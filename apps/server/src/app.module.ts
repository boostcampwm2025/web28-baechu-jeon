import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProjectsModule } from './projects/projects.module';
import { IntentionsModule } from './intentions/intentions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ProjectsModule,
    IntentionsModule,
  ],
})
export class AppModule {}
