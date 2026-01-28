import { Module, Global } from '@nestjs/common';
import { NcloudStorageService } from './ncloud-storage.service';

@Global()
@Module({
  providers: [NcloudStorageService],
  exports: [NcloudStorageService],
})
export class StorageModule {}
