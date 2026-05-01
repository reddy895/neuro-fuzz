import asyncio
import random
import time
from datetime import datetime


# Scripted sequence of healthcare-specific fuzzing events
FUZZ_SCENARIO = [
    ("INFO",     "AEGIS-FUZZ: Initializing Medical Device Sandbox (QEMU-ARM) [pacemaker-7721]"),
    ("INFO",     "AEGIS-FUZZ: Injecting DICOM/HL7 Protocol Fuzzing Hooks"),
    ("INFO",     "AEGIS-FUZZ: Loading AI-Generated Medical Seed Corpus (HL7v2, DICOM, FHIR)"),
    ("INFO",     "AEGIS-FUZZ: Enumerating EHR REST API endpoints..."),
    ("INFO",     "SCANNER: Discovered endpoint → GET /api/ehr/records/{id}"),
    ("INFO",     "SCANNER: Discovered endpoint → POST /api/ehr/records"),
    ("INFO",     "SCANNER: Discovered endpoint → GET /api/ehr/records/list"),
    ("INFO",     "FUZZER: Mutating Authorization headers with token corpus..."),
    ("INFO",     "FUZZER: Testing IDOR patterns on /api/ehr/records/REC-001 with foreign tokens..."),
    ("WARNING",  "ANOMALY: user_bob token returned HTTP 200 for REC-001 (owned by user_alice)"),
    ("CRITICAL", "UNIQUE CRASH: IDOR CONFIRMED on GET /api/ehr/records/{record_id} → VULN-EHR-001"),
    ("INFO",     "FUZZER: Testing POST /api/ehr/records with mismatched owner_id field..."),
    ("CRITICAL", "UNIQUE CRASH: MASS ASSIGNMENT on POST /api/ehr/records → VULN-EHR-002"),
    ("INFO",     "FUZZER: Testing enumeration rate — iterating REC-001 through REC-100..."),
    ("WARNING",  "ANOMALY: No rate limiting detected. 100 records fetched in 4.2 seconds."),
    ("CRITICAL", "UNIQUE CRASH: BULK IDOR ENUMERATION confirmed → VULN-EHR-003"),
    ("INFO",     "AEGIS-FUZZ: Session terminated. Handing off crash data to NeuroFuzz AI..."),
]


class FuzzEngine:
    def __init__(self):
        self.running = False
        self.stats = {
            "execs_per_sec": 0,
            "paths_total": 0,
            "crashes_unique": 0,
            "hangs_unique": 0,
            "stability": 100.0,
            "coverage": 0.0,
            "cpu_usage": 0,
            "mem_usage": 0
        }
        self.logs = []
        self.start_time = None
        self.latest_crash = {}   # Passed to AI analyzer

    async def start(self, callback):
        if self.running:
            return
        self.running = True
        self.start_time = time.time()
        self.stats = {
            "execs_per_sec": 450,
            "paths_total": 1,
            "crashes_unique": 0,
            "hangs_unique": 0,
            "stability": 99.9,
            "coverage": 0.1,
            "cpu_usage": 15,
            "mem_usage": 45
        }

        scenario_index = 0

        while self.running:
            # Gradually ramp up stats
            self.stats["execs_per_sec"] = random.randint(800, 1500)
            self.stats["cpu_usage"] = random.randint(55, 92)
            self.stats["mem_usage"] = random.randint(110, 240)

            # Emit next scripted scenario log
            if scenario_index < len(FUZZ_SCENARIO):
                level, msg = FUZZ_SCENARIO[scenario_index]
                self._add_log(f"[{level}] {msg}")

                if level == "CRITICAL":
                    self.stats["crashes_unique"] += 1
                    # Tag the latest crash with vuln_index for the AI analyzer
                    if "VULN-EHR-001" in msg:
                        self.latest_crash = {"vuln_index": 0}
                    elif "VULN-EHR-002" in msg:
                        self.latest_crash = {"vuln_index": 1}
                    elif "VULN-EHR-003" in msg:
                        self.latest_crash = {"vuln_index": 2}

                elif level == "WARNING":
                    self.stats["hangs_unique"] += 1

                if random.random() > 0.6:
                    self.stats["paths_total"] += random.randint(1, 4)
                    self.stats["coverage"] = round(
                        min(100.0, self.stats["coverage"] + random.uniform(0.3, 1.2)), 1
                    )

                scenario_index += 1
            else:
                # After scenario ends, just emit generic scanning logs
                self._add_log("[INFO] AEGIS-FUZZ: Passive scanning — monitoring for regression crashes...")

            await callback({
                "type": "update",
                "stats": self.stats,
                "log": self.logs[-1] if self.logs else "",
                "latest_crash": self.latest_crash
            })
            await asyncio.sleep(1.2)

    def stop(self):
        self.running = False
        self._add_log("[INFO] AEGIS-FUZZ: Session halted. NeuroFuzz AI ready for deep scan.")

    def _add_log(self, msg):
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {msg}"
        self.logs.append(log_entry)
        if len(self.logs) > 100:
            self.logs.pop(0)

    def get_status(self):
        return {
            "running": self.running,
            "stats": self.stats,
            "logs": self.logs,
            "latest_crash": self.latest_crash
        }


engine = FuzzEngine()
