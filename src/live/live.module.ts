import { Module } from '@nestjs/common';
import { LiveGateway } from './live.gateway';
import { SeverityService } from '../severity/severity.service';

@Module({
  providers: [LiveGateway, SeverityService],
  exports: [LiveGateway],
})
export class LiveModule {}

