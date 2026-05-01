import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/aegisfuzz")

class Database:
    def __init__(self):
        self.client = AsyncIOMotorClient(MONGODB_URL)
        self.db = self.client.get_database()
        
    def get_db(self):
        return self.db
    
    def get_client(self):
        return self.client

db_manager = Database()
db = db_manager.get_db()
client = db_manager.get_client()
