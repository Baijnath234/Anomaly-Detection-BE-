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
import { ZScoreDetector } from '../detection/detectors/zscore.detector';
import { SeverityService } from '../severity/severity.service';

export interface LiveMetricPayload {
  systemId: string;
  timestamp: string;
  values: Record<string, number>;
}

@WebSocketGateway({
  namespace: '/live',
  cors: { origin: '*' },
})
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LiveGateway.name);
  // In-memory sliding window history per system: systemId -> array of rows
  private systemWindows: Map<string, number[][]> = new Map();
  private systemColumns: Map<string, string[]> = new Map();
  private detector: ZScoreDetector = new ZScoreDetector();

  constructor(private readonly severityService: SeverityService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Live client connected: ${client.id}`);
    client.emit('connected', { message: 'Connected to Live Anomaly Detection Stream' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Live client disconnected: ${client.id}`);
  }

  @SubscribeMessage('metrics:stream')
  handleMetricStream(
    @MessageBody() data: LiveMetricPayload,
    @ConnectedSocket() client: Socket,
  ) {
    if (!data || !data.systemId || !data.values) {
      client.emit('error', { message: 'Invalid payload: systemId and values are required' });
      return;
    }

    const { systemId, timestamp, values } = data;
    const cols = Object.keys(values).sort();

    if (!this.systemColumns.has(systemId)) {
      this.systemColumns.set(systemId, cols);
    }

    const row = cols.map((col) => values[col] ?? 0);
    let window = this.systemWindows.get(systemId);
    if (!window) {
      window = [];
      this.systemWindows.set(systemId, window);
    }

    window.push(row);
    // Keep sliding window of latest 50 observations
    if (window.length > 50) {
      window.shift();
    }

    // Perform sliding-window anomaly check once sufficient buffer accumulated (>= 5 rows)
    if (window.length >= 5) {
      this.detector.fit(window, { sensitivity: 0.85 });
      const result = this.detector.predict([row]);
      const score = result.scores[0] ?? 0;
      const isAnomaly = result.flags[0] ?? false;

      if (isAnomaly || score >= 0.65) {
        const severity = this.severityService.calculateSeverity(score);
        const anomalyPayload = {
          systemId,
          timestamp: timestamp || new Date().toISOString(),
          score: parseFloat(score.toFixed(3)),
          severity,
          values,
          isAnomaly,
        };

        // Broadcast to all clients subscribed to /live
        this.server.emit('anomaly', anomalyPayload);
        this.logger.warn(
          `[Live Stream] Anomaly detected on System ${systemId} (${severity}) - Score: ${score.toFixed(3)}`,
        );
      }
    }

    // Acknowledge receipt
    client.emit('metrics:ack', {
      systemId,
      timestamp: timestamp || new Date().toISOString(),
      bufferSize: window.length,
    });
  }
}

