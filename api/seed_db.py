import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/aegisfuzz")

async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.get_database()
    
    # 1. Seed Patients / Medical Records
    patients = [
        {
            "patient_id": "P-1001",
            "name": "Alice Smith",
            "age": 34,
            "diagnosis": "Type 1 Diabetes",
            "vitals": {"pulse": 72, "temp": 98.6},
            "created_at": datetime.now()
        },
        {
            "patient_id": "P-1002",
            "name": "Bob Jones",
            "age": 45,
            "diagnosis": "Hypertension",
            "vitals": {"pulse": 88, "temp": 99.1},
            "created_at": datetime.now()
        }
    ]
    
    # 2. Seed Vulnerability Logs (Historical)
    vuln_logs = [
        {
            "event_id": "EVT-8821",
            "type": "IDOR",
            "severity": "Critical",
            "source": "EHR-API",
            "raw_payload": "GET /api/records/1234?user_id=attacker",
            "timestamp": datetime.now()
        },
        {
            "event_id": "EVT-9902",
            "type": "Buffer Overflow",
            "severity": "Critical",
            "source": "BLE-Firmware",
            "raw_payload": "0x41" * 512,
            "timestamp": datetime.now()
        }
    ]
    
    print("Seeding collections...")
    await db.patients.delete_many({})
    await db.patients.insert_many(patients)
    
    await db.vulnerability_logs.delete_many({})
    await db.vulnerability_logs.insert_many(vuln_logs)
    
    print("Seeding complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
