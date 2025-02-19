from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = None
    username: str
    email: EmailStr
    hashed_password: str
    created_at: datetime = datetime.utcnow()

class ImageUpload(BaseModel):
    id: Optional[str] = None
    user_id: str
    image_url: str
    uploaded_at: datetime = datetime.utcnow()
