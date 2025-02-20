from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from database import db
from typing import Optional

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")  # Token authentication scheme
router = APIRouter()

class UserSignup(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = None

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Verifies JWT token and retrieves user email."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/signup")
async def signup(user: UserSignup):
    """Registers a new user with hashed password storage."""
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(user.password)
    new_user = {
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(new_user)
    return {"message": "User created successfully"}

@router.post("/login")
async def login(user: UserLogin):
    """Authenticates user and returns JWT token."""
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token_data = {"sub": user.email, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer"}

@router.put('/update-profile')
async def update_profile(
    update_data: UserUpdate,
    current_user_email: str = Depends(get_current_user)
):
    # Get user from database
    db_user = await db.users.find_one({"email": current_user_email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify current password
    if not verify_password(update_data.currentPassword, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid current password")

    # Prepare update fields
    update_fields = {}
    if update_data.firstName:
        update_fields["firstName"] = update_data.firstName
    if update_data.lastName:
        update_fields["lastName"] = update_data.lastName
    if update_data.newPassword:
        update_fields["hashed_password"] = hash_password(update_data.newPassword)

    # If no fields to update
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Perform update
    update_fields["updated_at"] = datetime.utcnow()
    await db.users.update_one(
        {"email": current_user_email},
        {"$set": update_fields}
    )

    return {
        "message": "Profile updated successfully",
        "updated_fields": list(update_fields.keys())
    }

@router.get("/home")
async def home(current_user: str = Depends(get_current_user)):
    """Protected route: Only accessible with a valid JWT token."""
    return {"message": f"Welcome to Home, {current_user}!"}
