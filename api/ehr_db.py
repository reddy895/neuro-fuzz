from typing import Dict, Optional, List
from pydantic import BaseModel
from datetime import datetime


class MedicalRecord(BaseModel):
    id: str
    owner_id: str
    patient_name: str
    date_of_birth: str
    ssn_last4: str
    blood_type: str
    diagnosis: str
    icd10_code: str
    treatment_plan: str
    prescriptions: List[str]
    allergies: List[str]
    last_visit: str
    attending_physician: str
    billing_amount: float
    insurance_provider: str


# --- Vulnerability Registry ---
# Each entry represents a known/testable security flaw in the mock system
VULNERABILITIES = [
    {
        "id": "VULN-EHR-001",
        "target": "GET /api/ehr/records/{record_id}",
        "type": "IDOR (Insecure Direct Object Reference)",
        "cwe": "CWE-639",
        "severity": "High",
        "exploitability": "High",
        "description": "The EHR records endpoint does not enforce ownership before returning data. Any authenticated user can access another patient's full medical record by guessing/iterating record IDs.",
        "root_cause": "Authorization check missing: record.owner_id is not validated against the requesting user's token before serving the response.",
        "compliance_impact": "HIPAA §164.312(a)(1) – Access Control Violation | GDPR Art. 5(1)(f) – Integrity & Confidentiality Breach",
        "patient_safety": "HIGH – Exposes PII, diagnoses, prescriptions and financial data of all patients.",
        "exploitation_payload": 'curl.exe -H "Authorization: Bearer user_bob" http://localhost:8000/api/ehr/records/REC-001',
        "exploitation_explanation": "user_bob is authenticated but is requesting REC-001 which belongs to user_alice. Without the IDOR check, the server leaks Alice's full record to Bob.",
        "remediation": "Enforce: if record.owner_id != requesting_user_id → return HTTP 403 Forbidden.",
    },
    {
        "id": "VULN-EHR-002",
        "target": "POST /api/ehr/records",
        "type": "Missing Input Validation / Mass Assignment",
        "cwe": "CWE-915",
        "severity": "Critical",
        "exploitability": "High",
        "description": "The POST endpoint accepts arbitrary JSON and creates records without validating that the owner_id matches the authenticated user, allowing impersonation.",
        "root_cause": "Model binding does not strip the owner_id field; attacker can set owner_id to any patient and forge a medical record.",
        "compliance_impact": "FDA 21 CFR Part 11 – Data Integrity Violation | HIPAA ePHI Integrity Risk",
        "patient_safety": "CRITICAL – Forged records could cause misdiagnosis or incorrect medication.",
        "exploitation_payload": """curl.exe -X POST http://localhost:8000/api/ehr/records \\
  -H "Authorization: Bearer user_attacker" \\
  -H "Content-Type: application/json" \\
  -d '{"id":"REC-999","owner_id":"user_alice","patient_name":"Alice Smith","date_of_birth":"1985-03-22","ssn_last4":"4821","blood_type":"A+","diagnosis":"FORGED: Severe Allergy to Penicillin","icd10_code":"T36.0X5A","treatment_plan":"Do NOT administer Penicillin","prescriptions":["None"],"allergies":["Penicillin"],"last_visit":"2026-05-01","attending_physician":"Dr. Attacker","billing_amount":0.0,"insurance_provider":"None"}'""",
        "exploitation_explanation": "Attacker sets owner_id to user_alice and creates a forged record under her account. Medical staff querying her records see the tampered data.",
        "remediation": "Override owner_id server-side from the authenticated token. Never trust client-supplied ownership fields.",
    },
    {
        "id": "VULN-EHR-003",
        "target": "GET /api/ehr/records/{record_id}",
        "type": "Bulk IDOR / Scripted Enumeration",
        "cwe": "CWE-284",
        "severity": "Critical",
        "exploitability": "High",
        "description": "The API has no rate limiting or enumeration protection. An attacker can iterate through sequential record IDs (REC-001 to REC-999) to dump all patient records.",
        "root_cause": "No rate limiting, no CAPTCHA, and predictable sequential record IDs make bulk scraping trivial.",
        "compliance_impact": "HIPAA Breach Notification Rule | Mass PHI Exposure",
        "patient_safety": "CRITICAL – Full database of patient PHI can be exfiltrated in under 60 seconds.",
        "exploitation_payload": """for /L %i in (1,1,100) do curl.exe -H "Authorization: Bearer user_bob" http://localhost:8000/api/ehr/records/REC-00%i""",
        "exploitation_explanation": "A simple for-loop iterates all sequential IDs. No rate limiting means 100+ records can be scraped in seconds.",
        "remediation": "1) Implement rate limiting (e.g. 10 req/min per token). 2) Use UUIDs instead of sequential IDs. 3) Add anomaly detection for bulk access patterns.",
    },
]

# --- In-Memory Patient Database ---
db: Dict[str, MedicalRecord] = {}


def init_db():
    records = [
        MedicalRecord(
            id="REC-001", owner_id="user_alice",
            patient_name="Alice Smith", date_of_birth="1985-03-22",
            ssn_last4="4821", blood_type="A+",
            diagnosis="Essential Hypertension", icd10_code="I10",
            treatment_plan="Lisinopril 10mg daily. Low-sodium diet. Monthly BP monitoring.",
            prescriptions=["Lisinopril 10mg", "Aspirin 81mg"],
            allergies=["Sulfa drugs"],
            last_visit="2026-04-10", attending_physician="Dr. Sarah Chen, MD",
            billing_amount=320.50, insurance_provider="BlueCross BlueShield"
        ),
        MedicalRecord(
            id="REC-002", owner_id="user_bob",
            patient_name="Bob Jones", date_of_birth="1972-11-08",
            ssn_last4="9034", blood_type="O-",
            diagnosis="Type 2 Diabetes Mellitus", icd10_code="E11.9",
            treatment_plan="Metformin 500mg twice daily. Quarterly HbA1c testing. Dietary counseling.",
            prescriptions=["Metformin 500mg", "Glipizide 5mg"],
            allergies=["Penicillin", "Latex"],
            last_visit="2026-04-22", attending_physician="Dr. James Patel, MD",
            billing_amount=540.00, insurance_provider="Aetna Health"
        ),
        MedicalRecord(
            id="REC-003", owner_id="user_carol",
            patient_name="Carol White", date_of_birth="1990-07-14",
            ssn_last4="2267", blood_type="B+",
            diagnosis="Generalized Anxiety Disorder", icd10_code="F41.1",
            treatment_plan="Sertraline 50mg daily. CBT sessions bi-weekly. Sleep hygiene program.",
            prescriptions=["Sertraline 50mg", "Clonazepam 0.5mg PRN"],
            allergies=["None known"],
            last_visit="2026-04-28", attending_physician="Dr. Emily Rodriguez, PsyD",
            billing_amount=290.00, insurance_provider="United Healthcare"
        ),
        MedicalRecord(
            id="REC-004", owner_id="user_david",
            patient_name="David Park", date_of_birth="1965-01-30",
            ssn_last4="7712", blood_type="AB+",
            diagnosis="Chronic Obstructive Pulmonary Disease (COPD)", icd10_code="J44.1",
            treatment_plan="Tiotropium inhaler once daily. Pulmonary rehab 3x/week. Annual spirometry.",
            prescriptions=["Tiotropium 18mcg inhaler", "Albuterol rescue inhaler", "Prednisone 5mg"],
            allergies=["NSAIDs", "Codeine"],
            last_visit="2026-03-15", attending_physician="Dr. Michael Wong, MD",
            billing_amount=780.25, insurance_provider="Medicare"
        ),
        MedicalRecord(
            id="REC-005", owner_id="user_emma",
            patient_name="Emma Johnson", date_of_birth="1998-09-03",
            ssn_last4="5581", blood_type="A-",
            diagnosis="Iron Deficiency Anemia", icd10_code="D50.9",
            treatment_plan="Ferrous sulfate 325mg twice daily with Vitamin C. Dietary iron intake increase. Recheck CBC in 3 months.",
            prescriptions=["Ferrous Sulfate 325mg", "Vitamin C 500mg"],
            allergies=["Aspirin"],
            last_visit="2026-04-30", attending_physician="Dr. Sarah Chen, MD",
            billing_amount=185.00, insurance_provider="Cigna"
        ),
    ]
    for r in records:
        db[r.id] = r


init_db()


def get_record(record_id: str) -> Optional[MedicalRecord]:
    return db.get(record_id)


def create_record(record: MedicalRecord) -> MedicalRecord:
    db[record.id] = record
    return record


def list_records(owner_id: str) -> List[MedicalRecord]:
    return [r for r in db.values() if r.owner_id == owner_id]


def get_all_vulnerabilities():
    return VULNERABILITIES


def get_vulnerability_by_index(index: int):
    return VULNERABILITIES[index % len(VULNERABILITIES)]
