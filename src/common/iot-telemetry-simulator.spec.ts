import {
  IoTTelemetrySimulator,
  SimulatedTelemetryPacket,
} from '../../scripts/iot-telemetry-simulator';

describe('IoTTelemetrySimulator (Task 2 Hardware Integration)', () => {
  let simulator: IoTTelemetrySimulator;

  beforeEach(() => {
    simulator = new IoTTelemetrySimulator('test_esp32_ctrl', 'test_circuit_01');
  });

  it('should generate valid normal telemetry adhering to hardware specification', () => {
    const reading: SimulatedTelemetryPacket = simulator.generateReading('NORMAL');

    expect(reading.controller_id).toBe('test_esp32_ctrl');
    expect(reading.circuits).toHaveLength(1);

    const circuit = reading.circuits[0];
    expect(circuit.circuit_id).toBe('test_circuit_01');
    expect(circuit.voltage_rms).toBeGreaterThanOrEqual(220);
    expect(circuit.voltage_rms).toBeLessThanOrEqual(240);
    expect(circuit.current_rms).toBeGreaterThan(0);
    expect(circuit.power_factor).toBeGreaterThan(0.9);
    expect(circuit.power_factor).toBeLessThanOrEqual(1.0);
    expect(circuit.sensor_health.ct_connected).toBe(true);
    expect(circuit.sensor_health.temp_connected).toBe(true);
  });

  it('should correctly simulate overload conditions with increased current and temperature', () => {
    const reading = simulator.generateReading('OVERLOAD');
    const circuit = reading.circuits[0];

    expect(circuit.current_rms).toBeGreaterThanOrEqual(20.0);
    expect(circuit.active_power).toBeGreaterThan(4000);
  });

  it('should flag sensor disconnect when thermal sensor is unplugged (-127 C marker)', () => {
    const reading = simulator.generateReading('SENSOR_DISCONNECT');
    const circuit = reading.circuits[0];

    expect(circuit.temperature_c).toBe(-127.0);
    expect(circuit.sensor_health.temp_connected).toBe(false);
  });
});
