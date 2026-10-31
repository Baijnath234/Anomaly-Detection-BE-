#!/usr/bin/env python3
"""
Synthetic Electrical Telemetry Generator (Task 4)
Generates cleanly labelled synthetic datasets representing normal domestic loads
and realistic electrical fault conditions (overload, sags, arcing, overheating, leakage).
"""

import csv
import json
import math
import random
import os

FAULT_CLASSES = [
    "NORMAL",
    "OVERCURRENT",
    "VOLTAGE_SAG",
    "VOLTAGE_SURGE",
    "OVERHEATING",
    "EARTH_LEAKAGE",
    "MICRO_ARCING",
    "SENSOR_MALFUNCTION"
]

def generate_record(scenario="NORMAL", timestamp=1793440000, circuit_rating=16.0):
    voltage = 230.0 + random.uniform(-2.0, 2.0)
    current = random.uniform(2.0, 8.0)
    pf = random.uniform(0.95, 0.99)
    freq = 50.0 + random.uniform(-0.05, 0.05)
    temp = 32.0 + random.uniform(-1.0, 1.5)
    leakage_ma = random.uniform(0.8, 2.0)
    mcb_status = "CLOSED"

    if scenario == "OVERCURRENT":
        current = circuit_rating * random.uniform(1.3, 1.8) # e.g. 25A on 16A breaker
        voltage -= random.uniform(3.0, 6.0) # line drop
        temp += random.uniform(4.0, 8.0)
    elif scenario == "VOLTAGE_SAG":
        voltage = random.uniform(175.0, 195.0)
    elif scenario == "VOLTAGE_SURGE":
        voltage = random.uniform(255.0, 275.0)
    elif scenario == "OVERHEATING":
        temp = random.uniform(72.0, 88.0) # terminal thermal runaway
        leakage_ma += random.uniform(1.0, 3.0)
    elif scenario == "EARTH_LEAKAGE":
        leakage_ma = random.uniform(22.0, 45.0) # approaching/exceeding 30mA RCD trip
    elif scenario == "MICRO_ARCING":
        current = random.uniform(6.0, 14.0)
        pf = random.uniform(0.65, 0.82) # distorted current waveform
        voltage += random.uniform(-8.0, 8.0) # transient noise
    elif scenario == "SENSOR_MALFUNCTION":
        temp = -127.0 # disconnected DS18B20 indicator

    active_power = round(voltage * current * pf, 1)
    reactive_power = round(voltage * current * math.sin(math.acos(min(1.0, pf))), 1)

    return {
        "timestamp": timestamp,
        "circuit_id": "ckt_living_ac_01",
        "circuit_rating_amps": circuit_rating,
        "voltage_rms": round(voltage, 1),
        "current_rms": round(current, 2),
        "active_power_watts": active_power,
        "reactive_power_var": reactive_power,
        "power_factor": round(pf, 2),
        "frequency_hz": round(freq, 2),
        "temperature_celsius": round(temp, 1),
        "leakage_current_ma": round(leakage_ma, 2),
        "mcb_trip_status": mcb_status,
        "label": scenario
    }

def main():
    out_dir = os.path.dirname(os.path.abspath(__file__)) + "/data"
    os.makedirs(out_dir, exist_ok=True)
    csv_path = os.path.join(out_dir, "synthetic_electrical_telemetry.csv")
    json_path = os.path.join(out_dir, "synthetic_electrical_telemetry.json")

    records = []
    base_ts = 1793440000

    # 1. Generate 800 normal baseline records
    for i in range(800):
        records.append(generate_record("NORMAL", base_ts + i))

    # 2. Generate 50 records for each fault type
    cur_ts = base_ts + 800
    for fault in FAULT_CLASSES:
        if fault == "NORMAL":
            continue
        for _ in range(50):
            records.append(generate_record(fault, cur_ts))
            cur_ts += 1

    # Write CSV
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(records[0].keys()))
        writer.writeheader()
        writer.writerows(records)

    # Write JSON
    with open(json_path, "w") as f:
        json.dump(records, f, indent=2)

    print(f"Generated {len(records)} synthetic electrical records at:\n- {csv_path}\n- {json_path}")

if __name__ == "__main__":
    main()

