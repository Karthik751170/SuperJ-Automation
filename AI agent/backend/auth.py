from typing import Optional
import os
import datetime
from jose import JWTError, jwt
import bcrypt

# JWT configurations
SECRET_KEY = os.getenv("SECRET_KEY", "b33fa43df65d49ae924c5bb20d43a6d96ff6f4c78a0d9e8751db59754b2d1844")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 hours

def get_password_hash(password: str) -> str:
    """Hashes a plain password using bcrypt directly (prevents passlib wrap-bug crashes)."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against its hashed value using bcrypt directly."""
    if not hashed_password:
        return False
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception as e:
        print(f"Bcrypt verification error: {e}")
        return False

def create_access_token(data: dict) -> str:
    """Generates a signed JWT access token containing claims data."""
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a signed JWT token claims."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
