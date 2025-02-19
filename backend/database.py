from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends

# MongoDB connection settings
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "EzHealth"

# Configure MongoDB client
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def get_db():
    try:
        await client.admin.command('ping')
        return db
    except Exception as e:
        print(f"Database connection error: {e}")
        raise