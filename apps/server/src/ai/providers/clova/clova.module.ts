import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClovaService } from './clova.service';
import { ClovaProvider } from './clova.provider';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [ClovaService, ClovaProvider],
  exports: [ClovaProvider],
})
export class ClovaModule {}
