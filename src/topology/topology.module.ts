import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Floor } from './entities/floor.entity';
import { Room } from './entities/room.entity';
import { ElectricalPanel } from './entities/electrical-panel.entity';
import { Circuit } from './entities/circuit.entity';
import { Switchboard } from './entities/switchboard.entity';
import { Device } from './entities/device.entity';
import { TopologyService } from './topology.service';
import { TopologyController } from './topology.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Building,
      Floor,
      Room,
      ElectricalPanel,
      Circuit,
      Switchboard,
      Device,
    ]),
  ],
  controllers: [TopologyController],
  providers: [TopologyService],
  exports: [TopologyService],
})
export class TopologyModule {}

