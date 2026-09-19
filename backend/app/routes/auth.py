from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
)

from sqlalchemy import select

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from ..database import get_db

from ..dependencies import (
    get_current_user,
)

from ..models import User

from ..schemas import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserResponse,
)

from ..security import (
    create_access_token,
    hash_password,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=201,
)
async def signup(
    data: SignupRequest,
    db: AsyncSession = Depends(get_db),
):

    allowed_roles = {
        "trainee",
        "trainer",
        "admin",
    }

    if data.role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail="Invalid role",
        )

    result = await db.execute(
        select(User).where(
            User.email == data.email
        )
    )

    existing_user = (
        result.scalar_one_or_none()
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(
            data.password
        ),
        role=data.role,
        institute=data.institute,
    )

    db.add(user)

    await db.commit()

    await db.refresh(user)

    token = create_access_token(
        user.id,
        user.role,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.post(
    "/login",
    response_model=AuthResponse,
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(User).where(
            User.email == data.email
        )
    )

    user = result.scalar_one_or_none()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        data.password,
        user.password_hash,
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if user.role != data.role:

        raise HTTPException(
            status_code=401,
            detail="Invalid role",
        )

    token = create_access_token(
        user.id,
        user.role,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.get(
    "/me",
    response_model=UserResponse,
)
async def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):

    return current_user


@router.post(
    "/logout",
    status_code=204,
)
async def logout():

    return Response(
        status_code=204
    )