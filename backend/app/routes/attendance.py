from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from ..database import get_db

from ..dependencies import (
    require_role,
)

from ..models import (
    Attendance,
    User,
)

from ..schemas import (
    AttendanceRequest,
)


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


@router.post("/check-in")
async def check_in(
    data: AttendanceRequest,
    current_user: User = Depends(
        require_role("trainee")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    attendance = Attendance(
        trainee_id=current_user.id,
        method=data.method,
        status="verified",
    )

    db.add(attendance)

    await db.commit()

    await db.refresh(attendance)

    return {
        "status": attendance.status,
        "timestamp": (
            attendance.timestamp.isoformat()
        ),
    }