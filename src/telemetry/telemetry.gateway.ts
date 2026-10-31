import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/electrical-live',
  cors: { origin: '*' },
})
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TelemetryGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Electrical telemetry client connected: ${client.id}`);
    client.emit('connected', { message: 'Connected to Real-time Electrical Telemetry Stream' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Electrical telemetry client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:circuit')
  handleSubscribeCircuit(
    @MessageBody() data: { circuitId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data?.circuitId) {
      client.join(`circuit:${data.circuitId}`);
      client.emit('subscribed', { circuitId: data.circuitId });
    }
  }

  broadcastTelemetry(circuitId: string, payload: any) {
    if (this.server) {
      this.server.to(`circuit:${circuitId}`).emit('telemetry:update', payload);
      this.server.emit('telemetry:global', payload);
    }
  }

  broadcastFaultAlert(circuitId: string, alert: any) {
    if (this.server) {
      this.server.emit('alert:triggered', { circuitId, ...alert });
    }
  }

  broadcastDeviceState(deviceId: string, state: 'ON' | 'OFF') {
    if (this.server) {
      this.server.emit('device:state_changed', { deviceId, state });
    }
  }
}
