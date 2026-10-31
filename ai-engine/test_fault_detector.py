#!/usr/bin/env python3
import unittest
from fault_detector import ElectricalFaultDetector

class TestElectricalFaultDetector(unittest.TestCase):
    def setUp(self):
        self.detector = ElectricalFaultDetector(nominal_voltage=230.0, default_breaker_rating=16.0)

    def test_normal_operation(self):
        reading = {
            "circuit_id": "c1",
            "voltage_rms": 230.5,
            "current_rms": 6.2,
            "power_factor": 0.98,
            "temperature_celsius": 32.0,
            "leakage_current_ma": 1.2
        }
        res = self.detector.evaluate(reading)
        self.assertEqual(res["fault_category"], "NORMAL")
        self.assertEqual(res["severity"], "NORMAL")
        self.assertEqual(res["maintenance_priority"], "LOW")

    def test_overcurrent_detection(self):
        reading = {
            "circuit_id": "c1",
            "voltage_rms": 226.0,
            "current_rms": 26.5, # > 16A * 1.5
            "power_factor": 0.96,
            "temperature_celsius": 36.0,
            "leakage_current_ma": 1.5
        }
        res = self.detector.evaluate(reading, {"breaker_rating_amps": 16.0})
        self.assertEqual(res["fault_category"], "OVERCURRENT")
        self.assertEqual(res["severity"], "CRITICAL")
        self.assertEqual(res["maintenance_priority"], "IMMEDIATE")

    def test_terminal_overheating_detection(self):
        reading = {
            "circuit_id": "c1",
            "voltage_rms": 230.0,
            "current_rms": 10.0,
            "temperature_celsius": 84.5 # Thermal runaway
        }
        res = self.detector.evaluate(reading)
        self.assertEqual(res["fault_category"], "OVERHEATING")
        self.assertEqual(res["severity"], "CRITICAL")
        self.assertIn("loose torque", res["recommended_action"].lower())

    def test_voltage_sag_detection(self):
        reading = {
            "circuit_id": "c1",
            "voltage_rms": 185.0, # Below 207V
            "current_rms": 4.0
        }
        res = self.detector.evaluate(reading)
        self.assertEqual(res["fault_category"], "UNDER_VOLTAGE")
        self.assertEqual(res["severity"], "WARNING")

    def test_earth_leakage_detection(self):
        reading = {
            "circuit_id": "c1",
            "voltage_rms": 230.0,
            "current_rms": 5.0,
            "leakage_current_ma": 32.5 # > 30mA
        }
        res = self.detector.evaluate(reading)
        self.assertEqual(res["fault_category"], "EARTH_LEAKAGE")
        self.assertEqual(res["severity"], "CRITICAL")

    def test_sensor_malfunction(self):
        reading = {
            "circuit_id": "c1",
            "voltage_rms": 230.0,
            "current_rms": 5.0,
            "temperature_celsius": -127.0 # DS18B20 disconnect
        }
        res = self.detector.evaluate(reading)
        self.assertEqual(res["fault_category"], "SENSOR_MALFUNCTION")
        self.assertEqual(res["severity"], "WARNING")

if __name__ == "__main__":
    unittest.main()

