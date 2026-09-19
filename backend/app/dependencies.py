from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jose import JWTError

from sqlalchemy import select

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from .database import get_db

from .models import User

from .security import decode_token


bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer
    ),
    db: AsyncSession = Depends(get_db),
) -> User:

    token = credentials.credentials

    try:

        payload = decode_token(token)

        user_id = payload.get("sub")

        if not user_id:

            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

        user_id = int(user_id)

    except (
        JWTError,
        ValueError,
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    result = await db.execute(
        select(User).where(
            User.id == user_id
        )
    )

    user = result.scalar_one_or_none()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


def require_role(
    *roles: str,
):

    async def checker(
        user: User = Depends(
            get_current_user
        ),
    ) -> User:

        if user.role not in roles:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You do not have permission "
                    "for this operation"
                ),
            )

        return user

    return checker