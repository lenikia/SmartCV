from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.database import get_db
from app.models.user import User
from app.core.config import settings

# OAuth2PasswordBearer does two things:
# 1. Tells FastAPI's OpenAPI/Swagger UI where the login endpoint is
#    so the "Authorize" button works in /docs
# 2. On each request, extracts the token from the
#    "Authorization: Bearer <token>" header automatically
#    and raises HTTP 401 if it's missing

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),  # FastAPI injects the token from the header
    db: Session = Depends(get_db)         # FastAPI injects the DB session
) -> User:
    
    # Define the exception once — we raise it in two places below
    # WWW-Authenticate header is part of the HTTP spec for Bearer auth
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the JWT. This verifies:
        # - the signature (was it signed with our SECRET_KEY?)
        # - the expiry (has the token expired?)
        # If either check fails, JWTError is raised
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # "sub" is the JWT standard claim for "subject" — who this token is about
        # We store the user's email there when we create the token in auth.py
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Token is valid — now confirm the user still exists in the DB
    # (they could have been deleted after the token was issued)
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    return user