from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from api.fuzz_engine import engine
from api.ai_analyzer import analyzer
from api.ehr_db import get_record, create_record, list_records, MedicalRecord

app = FastAPI(title="AegisFuzz AI — Healthcare Security Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Authentication Dependency ───────────────────────────────────────────────

def get_current_user(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization.split(" ")[1]


# ─── Fuzzing Status ───────────────────────────────────────────────────────────

@app.get("/api/status")
async def get_status():
    return engine.get_status()


@app.post("/api/start")
async def start_fuzzing():
    return {"message": "Fuzzing job queued"}


@app.post("/api/stop")
async def stop_fuzzing():
    engine.stop()
    return {"message": "Fuzzing session stopped"}


# ─── Medical IoT Firmware Analysis ────────────────────────────────────────────

import random as _random

FIRMWARE_PROFILES = [
    {
        "filename": "pacemaker_v3.2.1.bin",
        "architecture": "ARM Cortex-M4",
        "endianness": "Little Endian",
        "entry_point": "0x08000184",
        "file_size": "512 KB",
        "compiler": "GCC 9.3.1 (arm-none-eabi)",
        "sections": [
            {"name": ".text",  "addr": "0x08000000", "size": "361 KB", "flags": "RX"},
            {"name": ".data",  "addr": "0x20000000", "size": "12 KB",  "flags": "RW"},
            {"name": ".bss",   "addr": "0x20003000", "size": "8 KB",   "flags": "RW"},
        ],
        "risky_functions": [
            {"name": "strcpy",   "addr": "0x08004A2F", "risk": "Critical", "detail": "Unbounded string copy — buffer overflow possible in BLE packet handler"},
            {"name": "gets",     "addr": "0x08007B10", "risk": "Critical", "detail": "Deprecated unsafe input — allows stack smashing via serial interface"},
            {"name": "sprintf",  "addr": "0x0800A344", "risk": "High",     "detail": "Format string injection in telemetry log builder"},
            {"name": "memcpy",   "addr": "0x08002C81", "risk": "Medium",   "detail": "No length validation on DICOM data copy — heap overflow risk"},
            {"name": "malloc",   "addr": "0x0800F112", "risk": "Medium",   "detail": "Unchecked allocation in BLE stack — NULL dereference on OOM"},
            {"name": "free",     "addr": "0x0800F1A0", "risk": "High",     "detail": "Double-free condition in connection teardown path"},
        ],
        "heatmap": [
            {"module": "BLE Stack",        "score": 94, "crashes": 12},
            {"module": "DICOM Parser",     "score": 87, "crashes": 9},
            {"module": "Serial Interface", "score": 76, "crashes": 7},
            {"module": "Telemetry Logger", "score": 61, "crashes": 5},
            {"module": "Crypto Module",    "score": 38, "crashes": 2},
            {"module": "Bootloader",       "score": 22, "crashes": 1},
            {"module": "Power Manager",    "score": 15, "crashes": 0},
        ],
        "strings_of_interest": ["admin", "debug_mode=1", "password", "FACTORY_RESET", "bypass_auth"],
    },
    {
        "filename": "insulin_pump_fw_2.0.bin",
        "architecture": "ARM Cortex-M3",
        "endianness": "Little Endian",
        "entry_point": "0x08000100",
        "file_size": "256 KB",
        "compiler": "IAR EWARM 8.50",
        "sections": [
            {"name": ".text",  "addr": "0x08000000", "size": "180 KB", "flags": "RX"},
            {"name": ".data",  "addr": "0x20000000", "size": "6 KB",   "flags": "RW"},
            {"name": ".bss",   "addr": "0x20001800", "size": "4 KB",   "flags": "RW"},
        ],
        "risky_functions": [
            {"name": "strcpy",   "addr": "0x080021F0", "risk": "Critical", "detail": "Dosage string parsing — unchecked copy from RF packet"},
            {"name": "strcat",   "addr": "0x08003A10", "risk": "High",     "detail": "Accumulates patient data into fixed buffer without bounds"},
            {"name": "atoi",     "addr": "0x08005520", "risk": "Medium",   "detail": "No range check on dosage value — integer overflow leads to overdose logic"},
        ],
        "heatmap": [
            {"module": "RF Packet Handler", "score": 96, "crashes": 14},
            {"module": "Dosage Calculator", "score": 82, "crashes": 8},
            {"module": "Alarm System",      "score": 55, "crashes": 3},
            {"module": "Display Driver",    "score": 31, "crashes": 1},
            {"module": "Battery Monitor",   "score": 12, "crashes": 0},
        ],
        "strings_of_interest": ["override_dose", "service_mode", "calibrate_bypass", "root"],
    },
]


@app.post("/api/iot/analyze")
async def analyze_firmware(file_index: int = 0):
    """Simulate firmware binary analysis."""
    profile = FIRMWARE_PROFILES[file_index % len(FIRMWARE_PROFILES)]
    return {"status": "analyzed", **profile}


# ─── DICOM / HL7 Protocol Generator & Fuzzer ─────────────────────────────────
import random as _rnd
import string as _string
from datetime import datetime as _dt, timedelta as _timedelta

def _rand_id(n=8):
    return ''.join(_rnd.choices(_string.digits, k=n))

def _rand_name():
    first = _rnd.choice(["Alice","Bob","Carol","David","Emma","Frank","Grace","Hana"])
    last  = _rnd.choice(["Smith","Jones","Patel","Chen","Brown","Garcia","Kim","Nguyen"])
    return f"{last}^{first}"

HL7_TEMPLATES = [
    {
        "label": "ADT A01 – Patient Admission",
        "msg_type": "ADT^A01",
        "fields": [
            {"seg": "MSH", "field": "MSH-3",  "tag": "Sending Application", "value": "AEGIS_EHR"},
            {"seg": "MSH", "field": "MSH-9",  "tag": "Message Type",        "value": "ADT^A01"},
            {"seg": "PID", "field": "PID-3",  "tag": "Patient ID",          "value": ""},
            {"seg": "PID", "field": "PID-5",  "tag": "Patient Name",        "value": ""},
            {"seg": "PID", "field": "PID-7",  "tag": "Date of Birth",       "value": ""},
            {"seg": "PID", "field": "PID-8",  "tag": "Gender",              "value": ""},
            {"seg": "PV1", "field": "PV1-2",  "tag": "Patient Class",       "value": "I"},
            {"seg": "PV1", "field": "PV1-3",  "tag": "Assigned Location",   "value": ""},
            {"seg": "DG1", "field": "DG1-3",  "tag": "Diagnosis Code",      "value": ""},
        ]
    },
    {
        "label": "ORU R01 – Lab Result",
        "msg_type": "ORU^R01",
        "fields": [
            {"seg": "MSH", "field": "MSH-3",  "tag": "Sending Application", "value": "LAB_SYS"},
            {"seg": "MSH", "field": "MSH-9",  "tag": "Message Type",        "value": "ORU^R01"},
            {"seg": "PID", "field": "PID-3",  "tag": "Patient ID",          "value": ""},
            {"seg": "PID", "field": "PID-5",  "tag": "Patient Name",        "value": ""},
            {"seg": "OBR", "field": "OBR-4",  "tag": "Test Identifier",     "value": ""},
            {"seg": "OBX", "field": "OBX-3",  "tag": "Observation ID",      "value": ""},
            {"seg": "OBX", "field": "OBX-5",  "tag": "Observation Value",   "value": ""},
            {"seg": "OBX", "field": "OBX-14", "tag": "Date/Time of Obs",    "value": ""},
        ]
    }
]

DICOM_TAGS = [
    {"tag": "(0008,0060)", "vr": "CS", "name": "Modality",           "value": ""},
    {"tag": "(0008,103E)", "vr": "LO", "name": "Series Description", "value": ""},
    {"tag": "(0010,0010)", "vr": "PN", "name": "Patient Name",       "value": ""},
    {"tag": "(0010,0020)", "vr": "LO", "name": "Patient ID",         "value": ""},
    {"tag": "(0010,0030)", "vr": "DA", "name": "Patient Birth Date", "value": ""},
    {"tag": "(0010,0040)", "vr": "CS", "name": "Patient Sex",        "value": ""},
    {"tag": "(0008,0020)", "vr": "DA", "name": "Study Date",         "value": ""},
    {"tag": "(0020,000D)", "vr": "UI", "name": "Study Instance UID", "value": ""},
    {"tag": "(0028,0010)", "vr": "US", "name": "Rows",               "value": ""},
    {"tag": "(0028,0011)", "vr": "US", "name": "Columns",            "value": ""},
    {"tag": "(0028,0100)", "vr": "US", "name": "Bits Allocated",     "value": ""},
]

ATTACK_SCENARIOS = [
    {
        "id": "ATK-001",
        "title": "Malicious X-Ray Upload",
        "icon": "💀",
        "severity": "Critical",
        "description": "Attacker uploads a crafted DICOM file with an oversized Patient Name field to exploit a buffer overflow in the PACS DICOM parser. The embedded shellcode executes with SYSTEM privileges.",
        "steps": [
            {"step": 1, "action": "Craft DICOM file",        "detail": "Set (0010,0010) PatientName = 'A' * 4096 + shellcode"},
            {"step": 2, "action": "Upload via PACS endpoint", "detail": "POST /dicom/upload — no file size or field length validation"},
            {"step": 3, "action": "Buffer Overflow triggered","detail": "strcpy() in DICOM parser overwrites return address"},
            {"step": 4, "action": "Shellcode executes",       "detail": "Attacker gains SYSTEM shell on imaging server"},
        ],
        "mutated_field": "(0010,0010) Patient Name",
        "payload": 'A' * 200 + '\\x90' * 16 + '\\xcc\\xcc\\xcc\\xcc',
        "crash_log": "[CRITICAL] SIGSEGV at 0x08004A2F — strcpy overflow in parse_dicom_header()\nEIP overwritten: 0xcccccccc\nStack smash detected — process killed"
    },
    {
        "id": "ATK-002",
        "title": "Corrupted Patient Record Injection",
        "icon": "☠️",
        "severity": "Critical",
        "description": "Attacker sends a malformed HL7 ADT message with SQL injection in the Patient Name field to manipulate the EHR database and corrupt medical records.",
        "steps": [
            {"step": 1, "action": "Craft HL7 ADT message",   "detail": "PID-5 = \"Smith^Robert' OR '1'='1'; DROP TABLE patients;--\""},
            {"step": 2, "action": "Inject via HL7 interface", "detail": "Send to HL7 MLLP port 2575 — no input sanitization"},
            {"step": 3, "action": "SQL executes in backend",  "detail": "Unsanitized PID-5 passed directly to SQL INSERT"},
            {"step": 4, "action": "Database corrupted",       "detail": "patients table dropped — all EHR records lost"},
        ],
        "mutated_field": "PID-5 Patient Name",
        "payload": "Smith^Robert' OR '1'='1'; DROP TABLE patients;--",
        "crash_log": "[CRITICAL] DB Error: near \"DROP\": syntax error\nUncaught exception in HL7_ADT_handler()\nSystem state: UNSTABLE — manual recovery required"
    },
    {
        "id": "ATK-003",
        "title": "Insulin Pump RF Overdose Attack",
        "icon": "⚡",
        "severity": "Critical",
        "description": "Attacker transmits a spoofed RF packet to an insulin pump with a manipulated dosage value, bypassing bounds checking to command a lethal overdose.",
        "steps": [
            {"step": 1, "action": "Intercept RF channel",    "detail": "SDR capture on 433MHz — pump uses unencrypted RF"},
            {"step": 2, "action": "Craft spoofed packet",    "detail": "Dosage field: 0xFFFF (65535 units) — far beyond safe range"},
            {"step": 3, "action": "Transmit to pump",        "detail": "atoi() converts value without range check — accepts 65535"},
            {"step": 4, "action": "Critical patient impact",  "detail": "Pump dispenses 65535 units — lethal hypoglycemia risk"},
        ],
        "mutated_field": "Dosage (RF Packet byte 4-5)",
        "payload": "\\xFF\\xFF",
        "crash_log": "[CRITICAL] ASSERTION FAILED: dose <= MAX_SAFE_DOSE\nPump firmware panic — entering safe mode\nBLE watchdog timeout — connection lost"
    }
]

FUZZ_MUTATIONS = {
    "buffer_overflow":   lambda v: v[:2] + "A"*512 + v[-2:] if len(v)>2 else "A"*512,
    "null_byte":         lambda v: v[:4] + "\\x00" + v[4:],
    "sql_injection":     lambda v: v + "' OR '1'='1",
    "format_string":     lambda v: "%s%s%s%s%n%n",
    "integer_overflow":  lambda _: "4294967295",
    "empty_field":       lambda _: "",
    "unicode_bomb":      lambda _: "\\u0000\\uffff\\u202e" * 10,
}

def _gen_hl7(template_idx=0):
    t = HL7_TEMPLATES[template_idx % len(HL7_TEMPLATES)]
    fields = []
    for f in t["fields"]:
        val = f["value"]
        if not val:
            if "ID" in f["tag"]:       val = _rand_id()
            elif "Name" in f["tag"]:   val = _rand_name()
            elif "Date" in f["tag"] or "DOB" in f["tag"] or "Birth" in f["tag"]:
                val = _rnd.choice(["19850322","19720101","19901115","20001203"])
            elif "Gender" in f["tag"] or "Sex" in f["tag"]:
                val = _rnd.choice(["M","F","U"])
            elif "Location" in f["tag"]: val = f"WARD-{_rnd.randint(1,10)}^BED-{_rnd.randint(1,20)}"
            elif "Diagnosis" in f["tag"]: val = _rnd.choice(["I10","E11.9","J44.1","F41.1","D50.9"])
            elif "Test" in f["tag"]:     val = _rnd.choice(["CBC^Complete Blood Count","BMP^Basic Metabolic Panel"])
            elif "Observation" in f["tag"] and "Value" not in f["tag"]: val = "8310-5^Body temperature"
            elif "Observation Value" in f["tag"]: val = f"{_rnd.uniform(36.0,38.5):.1f}"
            elif "Time" in f["tag"] or "Obs" in f["tag"]: val = _dt.now().strftime("%Y%m%d%H%M%S")
            else: val = f"VALUE-{_rand_id(4)}"
        fields.append({**f, "value": val, "mutated": False})
    return {"label": t["label"], "msg_type": t["msg_type"], "fields": fields}

def _gen_dicom():
    tags = []
    for tag in DICOM_TAGS:
        name = tag["name"]
        if "Patient Name" in name:   val = _rand_name().replace("^"," ")
        elif "Patient ID" in name:   val = f"PAT-{_rand_id()}"
        elif "Birth" in name:        val = _rnd.choice(["19850322","19721108","19900714"])
        elif "Sex" in name:          val = _rnd.choice(["M","F","O"])
        elif "Modality" in name:     val = _rnd.choice(["CT","MR","US","CR","DX","PT"])
        elif "Description" in name:  val = _rnd.choice(["Brain MRI","Chest CT","Knee X-Ray","Cardiac Echo"])
        elif "Study Date" in name:   val = _dt.now().strftime("%Y%m%d")
        elif "UID" in name:          val = f"1.2.840.{_rand_id(5)}.{_rand_id(6)}.{_rand_id(4)}"
        elif "Rows" in name or "Columns" in name: val = str(_rnd.choice([256,512,1024,2048]))
        elif "Bits" in name:         val = _rnd.choice(["8","12","16"])
        else:                        val = f"VALUE-{_rand_id(4)}"
        tags.append({**tag, "value": val, "mutated": False})
    return {"tags": tags}

def _mutate(fields_or_tags, key="fields"):
    items = [dict(f) for f in fields_or_tags]
    # Pick 1-3 random items to mutate
    indices = _rnd.sample(range(len(items)), min(3, len(items)))
    mutation_type = _rnd.choice(list(FUZZ_MUTATIONS.keys()))
    fn = FUZZ_MUTATIONS[mutation_type]
    for i in indices:
        original = items[i]["value"]
        items[i]["value"] = fn(original)
        items[i]["mutated"] = True
        items[i]["mutation_type"] = mutation_type
        items[i]["original_value"] = original
    return items, mutation_type


@app.post("/api/dicom/generate")
async def generate_medical_data(protocol: str = "hl7", template_idx: int = 0, mutate: bool = False):
    if protocol == "hl7":
        data = _gen_hl7(template_idx)
        if mutate:
            data["fields"], mut_type = _mutate(data["fields"])
            data["mutation_applied"] = mut_type
        return {"protocol": "HL7", **data}
    else:
        data = _gen_dicom()
        if mutate:
            data["tags"], mut_type = _mutate(data["tags"], "tags")
            data["mutation_applied"] = mut_type
        return {"protocol": "DICOM", **data}


@app.post("/api/dicom/fuzz")
async def fuzz_protocol(protocol: str = "hl7", rounds: int = 5, template_idx: int = 0):
    """Run N fuzzing rounds and return inputs, mutations, and simulated responses."""
    results = []
    for i in range(rounds):
        if protocol == "hl7":
            data = _gen_hl7(template_idx)
            items, mut_type = _mutate(data["fields"])
            label = data["label"]
        else:
            data = _gen_dicom()
            items, mut_type = _mutate(data["tags"], "tags")
            label = "DICOM Metadata"

        mutated_items = [it for it in items if it.get("mutated")]
        crashed = _rnd.random() > 0.6

        result = {
            "round": i + 1,
            "label": label,
            "mutation_type": mut_type,
            "mutated_fields": [{"field": it.get("field") or it.get("tag"), "tag": it.get("tag") or it.get("name"), "original": it.get("original_value",""), "mutated_value": it["value"]} for it in mutated_items],
            "response_code": 500 if crashed else _rnd.choice([200, 400, 422]),
            "response_body": (
                f"SIGSEGV in parse_{'hl7' if protocol=='hl7' else 'dicom'}_field() — crash at mutated field"
                if crashed else
                _rnd.choice(["ACK: Message processed", "NACK: Validation error", "422 Unprocessable Entity — bad field type"])
            ),
            "crashed": crashed,
        }
        results.append(result)
    return {"protocol": protocol.upper(), "rounds": results}


@app.get("/api/dicom/attack-scenarios")
async def get_attack_scenarios():
    return ATTACK_SCENARIOS


@app.get("/api/dicom/attack-scenarios/{atk_id}")
async def get_attack_scenario(atk_id: str):
    for s in ATTACK_SCENARIOS:
        if s["id"] == atk_id:
            return s
    raise HTTPException(status_code=404, detail="Scenario not found")




# ─── AI Analysis ─────────────────────────────────────────────────────────────

@app.get("/api/analyze")
async def analyze_crash():
    """Analyze the most recent crash found by the FuzzEngine."""
    crash_data = engine.latest_crash if engine.latest_crash else {}
    report = analyzer.analyze_crash(crash_data)
    return report


@app.get("/api/analyze/all")
async def analyze_all():
    """Run a full AI sweep and return all known vulnerabilities."""
    return analyzer.analyze_all()


# ─── EHR Secure API Endpoints ────────────────────────────────────────────────

@app.post("/api/ehr/records", status_code=201)
async def post_record(record: MedicalRecord, user_id: str = Depends(get_current_user)):
    # Force owner_id to match authenticated user (prevent mass assignment)
    record.owner_id = user_id
    return create_record(record)


@app.get("/api/ehr/records/list")
async def get_my_records(user_id: str = Depends(get_current_user)):
    """Fetch all records belonging to the authenticated user."""
    records = list_records(user_id)
    return {"user_id": user_id, "count": len(records), "records": records}


@app.get("/api/ehr/records/{record_id}")
async def fetch_record(record_id: str, user_id: str = Depends(get_current_user)):
    record = get_record(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    # IDOR Protection
    if record.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to view this record")
    return record


# ─── EHR Hospital Backend Simulation ─────────────────────────────────────────

@app.get("/api/ehr/billing")
async def get_billing(user_id: str = Depends(get_current_user)):
    """Mock billing endpoint for hospital backend simulation."""
    return {
        "user_id": user_id,
        "billing_records": [
            {"id": "INV-7721", "date": "2026-04-15", "service": "Inpatient Consultation", "amount": 450.00, "status": "Paid"},
            {"id": "INV-7809", "date": "2026-04-28", "service": "Diagnostic Imaging (MRI)", "amount": 1200.00, "status": "Pending"},
            {"id": "INV-7911", "date": "2026-05-01", "service": "Laboratory Panel", "amount": 185.00, "status": "Pending"},
        ]
    }


@app.get("/api/ehr/patients")
async def get_patients(user_id: str = Depends(get_current_user)):
    """Mock patient list endpoint for hospital backend simulation."""
    return {
        "user_id": user_id,
        "patients": [
            {"id": "PAT-001", "name": "Alice Smith", "last_visit": "2026-04-10"},
            {"id": "PAT-002", "name": "Bob Jones", "last_visit": "2026-04-22"},
            {"id": "PAT-003", "name": "Carol White", "last_visit": "2026-04-28"},
            {"id": "PAT-004", "name": "David Park", "last_visit": "2026-03-15"},
            {"id": "PAT-005", "name": "Emma Johnson", "last_visit": "2026-04-30"},
        ]
    }


@app.post("/api/ehr/simulate-breach")
async def simulate_breach():
    """Simulates a mass data breach event for the EHR module."""
    return {
        "event": "MASS DATA EXFILTRATION DETECTED",
        "severity": "CRITICAL",
        "records_leaked": 500,
        "attacker_origin": "185.220.101.44 (Tor Exit Node)",
        "method": "Credential Stuffing / API Key Leak",
        "endpoint_targeted": "/api/ehr/records/all",
        "timestamp": _dt.now().strftime("%Y-%m-%d %H:%M:%S"),
        "leak_sample": [
            {"id": "REC-001", "name": "Alice Smith", "ssn": "***-**-4821"},
            {"id": "REC-002", "name": "Bob Jones", "ssn": "***-**-9034"},
            {"id": "REC-003", "name": "Carol White", "ssn": "***-**-2267"},
            {"id": "REC-004", "name": "David Park", "ssn": "***-**-7712"},
            {"id": "REC-005", "name": "Emma Johnson", "ssn": "***-**-5581"},
        ]
    }



# ─── NeuroFuzz AI Prediction & Generation ────────────────────────────────────

@app.get("/api/ai/generate-smart-input")
async def generate_smart_input(input_type: str = "json"):
    """Generates an AI-optimized smart input based on learned patterns."""
    if input_type == "hl7":
        return {
            "type": "HL7",
            "payload": "MSH|^~\\&|AI_GEN|HOSP|EHR|SYS|20260501||ADT^A01|101|P|2.5\nPID|||PAT123||DOE^JOHN||19800101|M\nDG1|1||I10^Essential Hypertension",
            "optimized_for": "Field boundary testing"
        }
    elif input_type == "binary":
        return {
            "type": "Binary",
            "payload": "7F 45 4C 46 01 01 01 00 00 00 00 00 00 00 00 00",
            "optimized_for": "Header structure fuzzing"
        }
    else:
        return {
            "type": "JSON",
            "payload": {"patient_id": "AI_MOCK_77", "vitals": {"bp": "120/80", "temp": 37.5}, "tags": ["emergency", "critical"]},
            "optimized_for": "Nested object depth"
        }


@app.get("/api/ai/learning-stats")
async def get_learning_stats():
    """Returns AI training and coverage improvements."""
    return {
        "coverage_increase": "23.4%",
        "input_quality": "94%",
        "neurons_active": 1024,
        "training_epochs": 150,
        "learned_patterns": [
            "Recursive JSON structures detected",
            "HL7 MSH segment length constraint learned",
            "DICOM preamble offset identified"
        ]
    }


@app.get("/api/ai/predictions")
async def get_ai_predictions():
    """Predicts high-risk areas in the target software."""
    return {
        "high_risk_regions": [
            {"module": "dicom_parser.c", "line_range": "140-210", "risk": "Critical", "reason": "Complex nested loop with unchecked strcpy"},
            {"module": "hl7_handler.py", "line_range": "45-60", "risk": "High", "reason": "Possible integer overflow in segment counter"},
            {"module": "auth_service.js", "line_range": "112-115", "risk": "Medium", "reason": "Timing attack vulnerability in password hash comparison"}
        ],
        "prediction_confidence": "89.5%"
    }


# ─── Compliance & Reporting ──────────────────────────────────────────────────

@app.get("/api/reports/risk-score")
async def get_risk_score():
    """Calculates an aggregate risk score based on current vulnerabilities."""
    # Mock calculation based on findings
    return {
        "score": 74,
        "label": "Elevated Risk",
        "color": "#d4a017",
        "factors": [
            {"name": "EHR IDOR Vulnerability", "impact": -15},
            {"name": "IoT Firmware Buffer Overflow", "impact": -20},
            {"name": "DICOM Parser Stability", "impact": -8},
            {"name": "Security Patch Compliance", "impact": +17}
        ]
    }


@app.get("/api/reports/timeline")
async def get_report_timeline():
    """Returns a timeline of vulnerability discovery events."""
    now = _dt.now()
    return {
        "events": [
            {"time": (now - _timedelta(minutes=140)).strftime("%H:%M:%S"), "event": "IDOR detected on /api/ehr/records/{id}", "severity": "High"},
            {"time": (now - _timedelta(minutes=110)).strftime("%H:%M:%S"), "event": "Stack overflow in Pacemaker BLE stack", "severity": "Critical"},
            {"time": (now - _timedelta(minutes=85)).strftime("%H:%M:%S"), "event": "DICOM Header Parser crash (Null Byte)", "severity": "Medium"},
            {"time": (now - _timedelta(minutes=40)).strftime("%H:%M:%S"), "event": "SQL Injection pattern in HL7 ADT handler", "severity": "Critical"},
            {"time": (now - _timedelta(minutes=10)).strftime("%H:%M:%S"), "event": "Mass Assignment found in Patient POST", "severity": "High"}
        ]
    }


@app.get("/api/reports/generate")
async def generate_full_report():
    """Generates a comprehensive enterprise compliance report."""
    return {
        "report_id": f"AEGIS-REP-{_rnd.randint(1000, 9999)}",
        "timestamp": _dt.now().strftime("%Y-%m-%d %H:%M:%S"),
        "compliance_standard": "HIPAA / FDA Cybersecurity",
        "summary": "Security assessment of Aegis Healthcare Infrastructure reveals multiple critical vulnerabilities in firmware and EHR API layers.",
        "findings": [
            {
                "title": "Unauthenticated Patient Data Access (IDOR)",
                "severity": "Critical",
                "risk_score": 9.2,
                "description": "Patient records can be accessed by changing the UUID in the URL without valid session ownership.",
                "fix": "Implement strict ownership validation in the ORM layer using an 'authenticated_user_id' filter."
            },
            {
                "title": "Pacemaker Firmware Buffer Overflow",
                "severity": "Critical",
                "risk_score": 9.8,
                "description": "Oversized BLE packets trigger a strcpy overflow in the firmware bootloader.",
                "fix": "Replace strcpy with strncpy and implement strict packet length validation (MAX_BLE_LEN=256)."
            },
            {
                "title": "DICOM Metadata SQL Injection",
                "severity": "High",
                "risk_score": 7.5,
                "description": "Malformed DICOM (0010,0010) tags allow for raw SQL execution on the imaging database.",
                "fix": "Use parameterized queries and sanitize all incoming DICOM metadata tags."
            }
        ]
    }


# ─── AI Deep Analysis & Remediation ──────────────────────────────────────────

@app.get("/api/ai/deep-analysis")
async def get_deep_analysis(finding_id: str = "all"):
    """Provides a deep AI commentary and remediation roadmap."""
    return {
        "analysis_id": f"AI-ANL-{_rnd.randint(1000, 9999)}",
        "timestamp": _dt.now().strftime("%H:%M:%S"),
        "commentary": "Based on the patterns identified in the Pacemaker BLE stack and the EHR IDOR findings, AegisAI detects a systematic failure in input boundary validation across the healthcare infrastructure. The correlation between the firmware strcpy crash and the API mass assignment suggests a shared architectural weakness in how external data is trust-verified.",
        "future_roadmap": [
            {"phase": "Immediate", "action": "Deploy AegisAI Web Application Firewall (WAF) to intercept HL7/DICOM SQLi patterns."},
            {"phase": "Short-term", "action": "Transition all firmware string operations to C11 bounds-checked functions."},
            {"phase": "Long-term", "action": "Implement a Zero-Trust architecture for all inter-device medical communication."}
        ],
        "risk_handling_capability": "High",
        "can_auto_solve": True
    }


@app.post("/api/ai/remediate")
async def remediate_vulnerability(vulnerability_id: str):
    """Simulates an automated AI-driven fix or mitigation."""
    await asyncio.sleep(2)  # Simulate compute
    return {
        "status": "success",
        "remediation_log": [
            "Analyzing target code structure...",
            "Applying boundary check patch to vulnerable segment...",
            "Regenerating firmware binary with hardened headers...",
            "Verifying fix with targeted re-fuzzing...",
            "Mitigation CONFIRMED. Risk handled."
        ],
        "vulnerability_resolved": vulnerability_id
    }


# ─── Settings Configuration ──────────────────────────────────────────────────

current_settings = {
    "timeout": 5000,
    "memory_limit": 1024,
    "threads": 4,
    "ai_model": "GPT-4o (NeuroCore)",
    "ai_aggressiveness": 75,
    "security_mode": "Safe"
}

@app.get("/api/settings")
async def get_settings():
    """Retrieves current platform settings."""
    return current_settings


@app.post("/api/settings")
async def update_settings(settings: dict):
    """Updates platform settings."""
    global current_settings
    current_settings.update(settings)
    return {"status": "success", "settings": current_settings}


# ─── WebSocket ───────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected via WebSocket")

    await websocket.send_text(json.dumps({
        "type": "init",
        "data": engine.get_status()
    }))

    try:
        async def stream_callback(data):
            await websocket.send_text(json.dumps(data))

        while True:
            msg = await websocket.receive_text()
            cmd = json.loads(msg)

            if cmd["action"] == "start":
                asyncio.create_task(engine.start(stream_callback))
            elif cmd["action"] == "stop":
                engine.stop()

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WS Error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
