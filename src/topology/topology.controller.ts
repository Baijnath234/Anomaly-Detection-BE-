import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TopologyService } from './topology.service';
import {
  CreateBuildingDto,
  CreateFloorDto,
  CreateRoomDto,
  CreatePanelDto,
  CreateCircuitDto,
  CreateSwitchboardDto,
  CreateDeviceDto,
  ToggleDeviceDto,
} from './dto';

@ApiTags('Topology & Smart Automation')
@Controller('api/topology')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TopologyController {
  constructor(private readonly topologyService: TopologyService) {}

  @Post('buildings')
  @ApiOperation({ summary: 'Register a new building / home' })
  async createBuilding(@Body() dto: CreateBuildingDto) {
    return await this.topologyService.createBuilding(dto);
  }

  @Get('buildings')
  @ApiOperation({ summary: 'List all buildings / homes' })
  async findAllBuildings() {
    return await this.topologyService.findAllBuildings();
  }

  @Get('buildings/:id/tree')
  @ApiOperation({ summary: 'Get full structural tree of a building (Rooms, Switchboards, Devices, Circuits)' })
  async getBuildingTree(@Param('id') id: string) {
    return await this.topologyService.getBuildingTree(id);
  }

  @Post('floors')
  @ApiOperation({ summary: 'Create floor in a building' })
  async createFloor(@Body() dto: CreateFloorDto) {
    return await this.topologyService.createFloor(dto);
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create room on a floor' })
  async createRoom(@Body() dto: CreateRoomDto) {
    return await this.topologyService.createRoom(dto);
  }

  @Post('panels')
  @ApiOperation({ summary: 'Create electrical panel in building' })
  async createPanel(@Body() dto: CreatePanelDto) {
    return await this.topologyService.createPanel(dto);
  }

  @Post('circuits')
  @ApiOperation({ summary: 'Create circuit in electrical panel' })
  async createCircuit(@Body() dto: CreateCircuitDto) {
    return await this.topologyService.createCircuit(dto);
  }

  @Get('circuits')
  @ApiOperation({ summary: 'List all electrical circuits' })
  async findAllCircuits() {
    return await this.topologyService.findAllCircuits();
  }

  @Get('circuits/:id')
  @ApiOperation({ summary: 'Get circuit by ID' })
  async findCircuitById(@Param('id') id: string) {
    return await this.topologyService.findCircuitById(id);
  }

  @Post('switchboards')
  @ApiOperation({ summary: 'Create switchboard in a room' })
  async createSwitchboard(@Body() dto: CreateSwitchboardDto) {
    return await this.topologyService.createSwitchboard(dto);
  }

  @Post('devices')
  @ApiOperation({ summary: 'Register electrical appliance or switch' })
  async createDevice(@Body() dto: CreateDeviceDto) {
    return await this.topologyService.createDevice(dto);
  }

  @Get('devices')
  @ApiOperation({ summary: 'List all registered devices' })
  async findAllDevices() {
    return await this.topologyService.findAllDevices();
  }

  @Post('devices/:id/toggle')
  @ApiOperation({ summary: 'Actuate device switch (ON / OFF)' })
  async toggleDevice(@Param('id') id: string, @Body() dto: ToggleDeviceDto) {
    return await this.topologyService.toggleDevice(id, dto);
  }
}

