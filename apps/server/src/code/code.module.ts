import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { CodeController } from './code.controller';

@Module({
  providers: [CodeService],
  controllers: [CodeController],
})
export class CodeModule {}
