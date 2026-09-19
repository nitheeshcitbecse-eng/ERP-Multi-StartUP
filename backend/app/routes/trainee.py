from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import select

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from ..courses import (
    trainee_courses,
    trainee_view,
)

from ..database import get_db

from ..demo import (
    demo_bundle,
    display_date,
    display_time,
    overlay_profile,
)

from ..dependencies import (
    require_role,
)

from ..models import (
    Attendance,
    CareerApplication,
    Course,
    CourseProgress,
    Notification,
    QuizAttempt,
    User,
)

from ..schemas import (
    BoosterQuizRequest,
    CareerApplicationRequest,
)


router = APIRouter(
    prefix="/trainee",
    tags=["Trainee"],
)


VERIFICATION_METHODS = {
    "face": "Face Recognition",
    "qr": "QR Scan",
}


def _attendance_summary(
    summary: dict,
    check_ins: list[Attendance],
) -> dict:
    """Adds the trainee's own check-ins to the attendance summary."""

    logs = [
        {
            "date": display_date(item.timestamp),
            "sessionTitle": "Self check-in",
            "status": "present",
            "time": display_time(item.timestamp),
            "verificationMethod": VERIFICATION_METHODS.get(
                item.method,
                item.method,
            ),
        }
        for item in check_ins
    ]

    present = summary["presentSessions"] + len(logs)
    total = summary["totalSessions"] + len(logs)

    summary.update(
        {
            "presentSessions": present,
            "totalSessions": total,
            "overallPercentage": (
                round(present * 100 / total)
                if total
                else 0
            ),
            "recentLogs": (
                logs + summary["recentLogs"]
            ),
        }
    )

    return summary


@router.get("/dashboard")
async def dashboard(
    current_user: User = Depends(
        # Trainers and admins preview the trainee portal too.
        require_role(
            "trainee",
            "trainer",
            "admin",
        )
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    data = demo_bundle("trainee")

    # Only the courses the institute's admin has published; there is no demo course data.
    data["courses"] = await trainee_courses(
        db,
        current_user,
    )

    if current_user.role != "trainee":
        return data

    overlay_profile(
        data["trainee"],
        current_user,
    )

    notifications = (
        await db.execute(
            select(Notification)
            .where(
                Notification.user_id
                == current_user.id
            )
            .order_by(
                Notification.created_at.desc()
            )
        )
    ).scalars().all()

    check_ins = (
        await db.execute(
            select(Attendance)
            .where(
                Attendance.trainee_id
                == current_user.id
            )
            .order_by(
                Attendance.timestamp.desc()
            )
        )
    ).scalars().all()

    data["attendance"] = _attendance_summary(
        data["attendance"],
        list(check_ins),
    )

    data["notifications"] = [
        {
            "id": str(item.id),
            "title": "Notification",
            "message": item.message,
            "timestamp": display_date(
                item.created_at
            ),
            "priority": "normal",
            "read": item.read,
            "type": "general",
        }
        for item in notifications
    ] + data["notifications"]

    return data


@router.patch(
    "/notifications/{notification_id}/read",
    status_code=204,
)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(
        require_role("trainee")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    # Demo notifications (e.g. "n-1") are not stored, so there is nothing to update.
    if not notification_id.isdigit():
        return

    result = await db.execute(
        select(Notification).where(
            Notification.id == int(notification_id),
            Notification.user_id
            == current_user.id,
        )
    )

    notification = (
        result.scalar_one_or_none()
    )

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    notification.read = True

    await db.commit()


@router.post("/booster-quiz")
async def submit_booster_quiz(
    data: BoosterQuizRequest,
    current_user: User = Depends(
        require_role("trainee")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    attempt = QuizAttempt(
        trainee_id=current_user.id,
        score=data.score,
        status="verified",
    )

    db.add(attempt)

    await db.commit()

    await db.refresh(attempt)

    return {
        "score": attempt.score,
        "status": attempt.status,
    }


@router.post(
    "/career-applications"
)
async def apply_for_opportunity(
    data: CareerApplicationRequest,
    current_user: User = Depends(
        require_role("trainee")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    application = CareerApplication(
        trainee_id=current_user.id,
        opportunity_id=data.opportunity_id,
        status="submitted",
    )

    db.add(application)

    await db.commit()

    return {
        "status": "submitted"
    }

@router.get("/courses")
async def list_courses(
    current_user: User = Depends(
        require_role(
            "trainee",
            "trainer",
            "admin",
        )
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    return await trainee_courses(
        db,
        current_user,
    )


async def _set_module_completed(
    course_id: int,
    module_id: str,
    completed: bool,
    user: User,
    db: AsyncSession,
) -> dict:

    course = (
        await db.execute(
            select(Course).where(
                Course.id == course_id,
                Course.institute
                == user.institute,
                Course.status == "published",
            )
        )
    ).scalar_one_or_none()

    if not course or not user.institute:

        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    module_ids = [
        module["id"]
        for module in course.modules or []
    ]

    if module_id not in module_ids:

        raise HTTPException(
            status_code=404,
            detail="Module not found",
        )

    progress = (
        await db.execute(
            select(CourseProgress).where(
                CourseProgress.course_id
                == course.id,
                CourseProgress.trainee_id
                == user.id,
            )
        )
    ).scalar_one_or_none()

    if not progress:

        progress = CourseProgress(
            course_id=course.id,
            trainee_id=user.id,
            completed_modules=[],
        )

        db.add(progress)

    done = set(progress.completed_modules or [])

    if completed:
        done.add(module_id)
    else:
        done.discard(module_id)

    # Keep course order, and drop ids of modules the admin has since removed.
    progress.completed_modules = [
        item for item in module_ids
        if item in done
    ]

    await db.commit()

    return trainee_view(
        course,
        progress.completed_modules,
    )


@router.post(
    "/courses/{course_id}/modules/{module_id}/complete"
)
async def complete_module(
    course_id: int,
    module_id: str,
    current_user: User = Depends(
        require_role("trainee")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    return await _set_module_completed(
        course_id,
        module_id,
        True,
        current_user,
        db,
    )


@router.delete(
    "/courses/{course_id}/modules/{module_id}/complete"
)
async def reopen_module(
    course_id: int,
    module_id: str,
    current_user: User = Depends(
        require_role("trainee")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    return await _set_module_completed(
        course_id,
        module_id,
        False,
        current_user,
        db,
    )
