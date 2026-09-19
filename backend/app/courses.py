"""
Courses published by institution admins.

Admins manage the courses of their own institute; trainees see only the
published courses of the institute they belong to. The shapes returned here
are the camelCase objects the React pages read.
"""

from datetime import date
from uuid import uuid4

from fastapi import HTTPException

from sqlalchemy import func, select

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from .models import (
    Course,
    CourseProgress,
    User,
)

from .schemas import CourseRequest


def require_institute(user: User) -> str:

    if not user.institute:

        raise HTTPException(
            status_code=400,
            detail=(
                "Your account is not linked to an institute. "
                "Ask an administrator to set it."
            ),
        )

    return user.institute


def _schedule(course: Course) -> str:
    """Where the course sits in its calendar: Unscheduled, Upcoming, Ongoing or Completed."""

    today = date.today()

    if not course.start_date:
        return "Unscheduled"

    if today < course.start_date:
        return "Upcoming"

    if course.end_date and today > course.end_date:
        return "Completed"

    return "Ongoing"


def _iso(value: date | None) -> str | None:

    return value.isoformat() if value else None


def _modules(course: Course) -> list[dict]:

    return [
        {
            "id": module["id"],
            "title": module["title"],
            "durationMinutes": module.get("duration_minutes", 0),
            "topics": module.get("topics", []),
        }
        for module in course.modules or []
    ]


def admin_view(
    course: Course,
    learners: int = 0,
) -> dict:

    return {
        "id": course.id,
        "title": course.title,
        "code": course.code,
        "category": course.category or "",
        "description": course.description or "",
        "trainerName": course.trainer_name or "",
        "institute": course.institute,
        "startDate": _iso(course.start_date),
        "endDate": _iso(course.end_date),
        "seats": course.seats,
        "learners": learners,
        "status": course.status,
        "schedule": _schedule(course),
        "modules": _modules(course),
        "createdAt": course.created_at.isoformat(),
        "updatedAt": course.updated_at.isoformat(),
    }


def trainee_view(
    course: Course,
    completed: list[str] | None = None,
) -> dict:

    done = set(completed or [])

    modules = _modules(course)

    current_found = False

    for module in modules:

        if module["id"] in done:
            module["status"] = "completed"

        elif not current_found:
            module["status"] = "in_progress"
            current_found = True

        else:
            module["status"] = "upcoming"

    completed_count = sum(
        1 for module in modules
        if module["status"] == "completed"
    )

    total = len(modules)

    next_module = next(
        (
            module for module in modules
            if module["status"] == "in_progress"
        ),
        None,
    )

    return {
        "id": course.id,
        "title": course.title,
        "code": course.code,
        "category": course.category or "",
        "description": course.description or "",
        "instructor": course.trainer_name or "",
        "institute": course.institute,
        "startDate": _iso(course.start_date),
        "endDate": _iso(course.end_date),
        "schedule": _schedule(course),
        "totalModules": total,
        "completedModules": completed_count,
        "progress": (
            round(completed_count * 100 / total)
            if total
            else 0
        ),
        "remainingMinutes": sum(
            module["durationMinutes"]
            for module in modules
            if module["status"] != "completed"
        ),
        "nextModuleId": (
            next_module["id"] if next_module else None
        ),
        "modules": modules,
    }


def build_modules(
    data: CourseRequest,
    existing: list[dict] | None = None,
) -> list[dict]:
    """Stores the modules, keeping the ids of existing ones so trainee progress survives edits."""

    known_ids = {
        module["id"]
        for module in existing or []
    }

    return [
        {
            "id": (
                module.id
                if module.id in known_ids
                else uuid4().hex[:12]
            ),
            "title": module.title,
            "duration_minutes": module.duration_minutes,
            "topics": module.topics,
        }
        for module in data.modules
    ]


async def learner_counts(
    db: AsyncSession,
    course_ids: list[int],
) -> dict[int, int]:
    """Number of trainees who have started each course."""

    if not course_ids:
        return {}

    rows = await db.execute(
        select(
            CourseProgress.course_id,
            func.count(CourseProgress.id),
        )
        .where(
            CourseProgress.course_id.in_(
                course_ids
            )
        )
        .group_by(
            CourseProgress.course_id
        )
    )

    return dict(rows.all())


async def admin_courses(
    db: AsyncSession,
    institute: str,
) -> list[dict]:

    courses = (
        await db.execute(
            select(Course)
            .where(
                Course.institute == institute
            )
            .order_by(
                Course.created_at.desc()
            )
        )
    ).scalars().all()

    counts = await learner_counts(
        db,
        [course.id for course in courses],
    )

    return [
        admin_view(
            course,
            counts.get(course.id, 0),
        )
        for course in courses
    ]


async def trainee_courses(
    db: AsyncSession,
    user: User,
) -> list[dict]:
    """Published courses of the user's institute, with the user's own progress."""

    if not user.institute:
        return []

    courses = (
        await db.execute(
            select(Course)
            .where(
                Course.institute == user.institute,
                Course.status == "published",
            )
            .order_by(
                Course.start_date.asc().nulls_last(),
                Course.created_at.desc(),
            )
        )
    ).scalars().all()

    progress = {
        item.course_id: item.completed_modules
        for item in (
            await db.execute(
                select(CourseProgress).where(
                    CourseProgress.trainee_id
                    == user.id,
                    CourseProgress.course_id.in_(
                        [course.id for course in courses]
                    ),
                )
            )
        ).scalars().all()
    } if courses else {}

    return [
        trainee_view(
            course,
            progress.get(course.id),
        )
        for course in courses
    ]
