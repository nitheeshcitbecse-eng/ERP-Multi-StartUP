from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
)

from sqlalchemy import select

from sqlalchemy.exc import IntegrityError

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from ..courses import (
    admin_courses,
    admin_view,
    build_modules,
    learner_counts,
    require_institute,
)

from ..database import get_db

from ..demo import (
    demo_bundle,
    overlay_profile,
)

from ..dependencies import (
    require_role,
)

from ..models import (
    Course,
    CourseProgress,
    NominationConflict,
    ResourceRequest,
    TimetableSession,
    User,
)

from ..schemas import (
    ConflictResolutionRequest,
    CourseRequest,
    ResourceRequestBody,
    SessionRequest,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/dashboard")
async def dashboard(
    institute: str | None = None,

    current_user: User = Depends(
        require_role("admin")
    ),

    db: AsyncSession = Depends(
        get_db
    ),
):

    session_query = select(
        TimetableSession
    )

    if institute:

        session_query = (
            session_query.where(
                TimetableSession.institute
                == institute
            )
        )

    sessions = (
        await db.execute(
            session_query.order_by(
                TimetableSession.id.desc()
            )
        )
    ).scalars().all()

    resolved_conflicts = {
        item.conflict_ref: item.resolution
        for item in (
            await db.execute(
                select(NominationConflict).where(
                    NominationConflict.status
                    == "resolved"
                )
            )
        ).scalars().all()
    }

    data = demo_bundle("admin")

    overlay_profile(
        data["admin"],
        current_user,
        institute_key="instituteName",
    )

    # Only courses this institute's admins have created; there is no demo course data.
    data["adminCourses"] = (
        await admin_courses(
            db,
            current_user.institute,
        )
        if current_user.institute
        else []
    )

    data["timetableSessions"] = [
        {
            "id": f"TS-{s.id}",
            "timeSlot": s.time_slot,
            "programme": "Scheduled session",
            "batch": "",
            "trainer": s.trainer,
            "room": s.room,
            "day": "Scheduled",
            "category": "General",
        }
        for s in sessions
    ] + data["timetableSessions"]

    for conflict in data["nominationConflicts"]:

        if conflict["id"] in resolved_conflicts:

            conflict["nominationStatus"] = "Confirmed"

            conflict["conflictReason"] = (
                "Resolved: "
                f"{resolved_conflicts[conflict['id']]}"
            )

    return data


async def _own_course(
    course_id: int,
    user: User,
    db: AsyncSession,
) -> Course:
    """Loads a course of the admin's own institute, or raises 404."""

    course = (
        await db.execute(
            select(Course).where(
                Course.id == course_id,
                Course.institute
                == require_institute(user),
            )
        )
    ).scalar_one_or_none()

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    return course


async def _commit_course(
    db: AsyncSession,
    course: Course,
) -> None:

    try:

        await db.commit()

    except IntegrityError:

        await db.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                f"A course with code \"{course.code}\" "
                "already exists at your institute."
            ),
        )

    await db.refresh(course)


@router.get("/courses")
async def list_courses(
    current_user: User = Depends(
        require_role("admin")
    ),

    db: AsyncSession = Depends(
        get_db
    ),
):

    return await admin_courses(
        db,
        require_institute(current_user),
    )


@router.post(
    "/courses",
    status_code=201,
)
async def create_course(
    data: CourseRequest,

    current_user: User = Depends(
        require_role("admin")
    ),

    db: AsyncSession = Depends(
        get_db
    ),
):

    course = Course(
        institute=require_institute(current_user),
        title=data.title,
        code=data.code,
        category=data.category,
        description=data.description,
        trainer_name=data.trainer_name,
        start_date=data.start_date,
        end_date=data.end_date,
        seats=data.seats,
        status=data.status,
        modules=build_modules(data),
        created_by=current_user.id,
    )

    db.add(course)

    await _commit_course(db, course)

    return admin_view(course)


@router.put("/courses/{course_id}")
async def update_course(
    course_id: int,

    data: CourseRequest,

    current_user: User = Depends(
        require_role("admin")
    ),

    db: AsyncSession = Depends(
        get_db
    ),
):

    course = await _own_course(
        course_id,
        current_user,
        db,
    )

    course.title = data.title
    course.code = data.code
    course.category = data.category
    course.description = data.description
    course.trainer_name = data.trainer_name
    course.start_date = data.start_date
    course.end_date = data.end_date
    course.seats = data.seats
    course.status = data.status
    course.modules = build_modules(
        data,
        course.modules,
    )

    await _commit_course(db, course)

    counts = await learner_counts(
        db,
        [course.id],
    )

    return admin_view(
        course,
        counts.get(course.id, 0),
    )


@router.delete(
    "/courses/{course_id}",
    status_code=204,
)
async def delete_course(
    course_id: int,

    current_user: User = Depends(
        require_role("admin")
    ),

    db: AsyncSession = Depends(
        get_db
    ),
):

    course = await _own_course(
        course_id,
        current_user,
        db,
    )

    # Progress rows go too (the FK cascades in PostgreSQL; this also covers other databases).
    for progress in (
        await db.execute(
            select(CourseProgress).where(
                CourseProgress.course_id
                == course.id
            )
        )
    ).scalars().all():

        await db.delete(progress)

    await db.delete(course)

    await db.commit()

    return Response(status_code=204)


@router.post(
    "/timetable/sessions"
)
async def schedule_session(
    data: SessionRequest,

    current_user: User = Depends(
        require_role("admin")
    ),

    db: AsyncSession = Depends(
        get_db
    ),
):

    session = TimetableSession(
        institute=current_user.institute,
        trainer=data.trainer,
        room=data.room,
        time_slot=data.time_slot,
    )

    db.add(session)

    await db.commit()

    await db.refresh(session)

    return {
        "id": session.id,
        "trainer": session.trainer,
        "room": session.room,
        "time_slot": session.time_slot,
    }


@router.post(
    "/nominations/conflicts/{conflict_id}/resolve"
)
async def resolve_conflict(
    conflict_id: str,

    data: ConflictResolutionRequest,

    current_user: User = Depends(
        require_role("admin")
    ),

    db: AsyncSession = Depends(
        get_db
    ),
):

    conflict = (
        await db.execute(
            select(NominationConflict).where(
                NominationConflict.conflict_ref
                == conflict_id
            )
        )
    ).scalar_one_or_none()

    if not conflict:

        conflict = NominationConflict(
            conflict_ref=conflict_id,
            institute=current_user.institute,
        )

        db.add(conflict)

    conflict.resolution = (
        data.resolution
    )

    conflict.status = "resolved"

    await db.commit()

    return {
        "status": "resolved"
    }


@router.post(
    "/resource-requests"
)
async def request_resource(
    data: ResourceRequestBody,

    current_user: User = Depends(
        require_role("admin")
    ),

    db: AsyncSession = Depends(
        get_db
    ),
):

    request = ResourceRequest(
        institute=current_user.institute,
        resource_id=data.resource_id,
        source_institute=data.source_institute,
        note=data.note,
        status="requested",
    )

    db.add(request)

    await db.commit()

    return {
        "status": "requested"
    }