/**
 * IoT Hardware Telemetry Simulator
 * Simulates ESP32-S3 IoT Controller telemetry with realistic electrical waveforms,
 * faults (overcurrent, thermal runaway, voltage sags, arcing), and sensor disconnects.
 */

export interface SimulatedTelemetryPacket {
  ts: number;
  controller_id: string;
  firmware_version: string;
  wifi_rssi: number;
  is_backfill: boolean;
  circuits: {
    circuit_id: string;
    voltage_rms: number;
    current_rms: number;
    active_power: number;
    reactive_power: number;
    power_factor: number;
    frequency_hz: number;
    temperature_c: number;
    leakage_current_ma: number;
    relay_state: 'ON' | 'OFF';
    mcb_trip_status: 'CLOSED' | 'TRIPPED';
    sensor_health: {
      ct_connected: boolean;
      temp_connected: boolean;
      energy_ic_ready: boolean;
    };
  }[];
}

export type SimulationScenario =
  | 'NORMAL'
  | 'OVERLOAD'
  | 'VOLTAGE_SAG'
  | 'OVERHEATING_TERMINAL'
  | 'MICRO_ARCING'
  | 'SENSOR_DISCONNECT';

export class IoTTelemetrySimulator {
  private baseVoltage = 230.0;
  private nominalFrequency = 50.0;
  private currentTemperature = 32.5;

  constructor(
    public readonly controllerId: string = 'ctrl_esp32_main_01',
    public readonly circuitId: string = 'ckt_living_ac_01',
  ) {}

  public generateReading(
    scenario: SimulationScenario = 'NORMAL',
    timestamp: number = Math.floor(Date.now() / 1000),
  ): SimulatedTelemetryPacket {
    let voltage = this.baseVoltage + (Math.random() * 2 - 1);
    let current = 5.0 + Math.random() * 0.5;
    let powerFactor = 0.96 + Math.random() * 0.02;
    let temp = this.currentTemperature;
    let leakageMa = 1.2 + Math.random() * 0.3;
    let ctConnected = true;
    let tempConnected = true;
    let mcbStatus: 'CLOSED' | 'TRIPPED' = 'CLOSED';

    switch (scenario) {
      case 'OVERLOAD':
        // Sudden overload (25A on a 16A breaker)
        current = 25.4 + Math.random() * 1.2;
        voltage -= 4.5; // IR voltage drop
        temp += 5.0;
        break;

      case 'VOLTAGE_SAG':
        // Grid brownout
        voltage = 188.0 + Math.random() * 3.0;
        break;

      case 'OVERHEATING_TERMINAL':
        // Loose screw terminal causes high resistive heating
        this.currentTemperature = Math.min(88.0, this.currentTemperature + 2.5);
        temp = this.currentTemperature;
        leakageMa += 2.0;
        break;

      case 'MICRO_ARCING':
        // Arcing produces erratic cycle current jitter and reduced power factor
        current = 8.0 + (Math.random() > 0.5 ? 4.0 : -3.0);
        powerFactor = 0.72 + Math.random() * 0.1;
        voltage += (Math.random() * 8 - 4); // Voltage notching
        break;

      case 'SENSOR_DISCONNECT':
        // Thermal sensor wire cut / detached
        tempConnected = false;
        temp = -127.0; // Standard DS18B20 disconnect marker
        break;

      case 'NORMAL':
      default:
        // Gradual ambient temperature drift
        this.currentTemperature = 32.0 + Math.sin(timestamp / 60) * 2.0;
        temp = this.currentTemperature;
        break;
    }

    const activePower = Math.round(voltage * current * powerFactor * 10) / 10;
    const reactivePower =
      Math.round(
        voltage * current * Math.sin(Math.acos(Math.min(1.0, powerFactor))) * 10,
      ) / 10;

    return {
      ts: timestamp,
      controller_id: this.controllerId,
      firmware_version: '1.2.0',
      wifi_rssi: -58 - Math.floor(Math.random() * 10),
      is_backfill: false,
      circuits: [
        {
          circuit_id: this.circuitId,
          voltage_rms: Math.round(voltage * 10) / 10,
          current_rms: Math.round(current * 100) / 100,
          active_power: activePower,
          reactive_power: reactivePower,
          power_factor: Math.round(powerFactor * 100) / 100,
          frequency_hz:
            Math.round(
              (this.nominalFrequency + (Math.random() * 0.1 - 0.05)) * 100,
            ) / 100,
          temperature_c: Math.round(temp * 10) / 10,
          leakage_current_ma: Math.round(leakageMa * 100) / 100,
          relay_state: 'ON',
          mcb_trip_status: mcbStatus,
          sensor_health: {
            ct_connected: ctConnected,
            temp_connected: tempConnected,
            energy_ic_ready: true,
          },
        },
      ],
    };
  }
}

// Self-run test demonstration if executed directly
if (require.main === module) {
  const simulator = new IoTTelemetrySimulator();
  console.log('--- NORMAL TELEMETRY ---');
  console.log(JSON.stringify(simulator.generateReading('NORMAL'), null, 2));

  console.log('\n--- OVERLOAD TELEMETRY ---');
  console.log(JSON.stringify(simulator.generateReading('OVERLOAD'), null, 2));

  console.log('\n--- SENSOR DISCONNECT TELEMETRY ---');
  console.log(
    JSON.stringify(simulator.generateReading('SENSOR_DISCONNECT'), null, 2),
  );
}
