from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
)

from sqlalchemy import select

from sqlalchemy.ext.asyncio import (
    AsyncSession,
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
    Announcement,
    CompetencyClaim,
    Intervention,
    Resource,
    TrainerNote,
    User,
)

from ..schemas import (
    AnnouncementRequest,
    InterventionRequest,
    TrainerNoteRequest,
)


router = APIRouter(
    prefix="/trainer",
    tags=["Trainer"],
)


UPLOAD_DIR = Path(
    "uploads/resources"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


@router.get("/dashboard")
async def dashboard(
    current_user: User = Depends(
        # Admins preview the trainer portal too.
        require_role(
            "trainer",
            "admin",
        )
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    data = demo_bundle("trainer")

    if current_user.role != "trainer":
        return data

    overlay_profile(
        data["trainer"],
        current_user,
    )

    interventions = (
        await db.execute(
            select(Intervention)
            .where(
                Intervention.trainer_id
                == current_user.id
            )
            .order_by(
                Intervention.created_at.desc()
            )
        )
    ).scalars().all()

    notes = (
        await db.execute(
            select(TrainerNote)
            .where(
                TrainerNote.trainer_id
                == current_user.id
            )
            .order_by(
                TrainerNote.created_at.desc()
            )
        )
    ).scalars().all()

    verified_claims = set(
        (
            await db.execute(
                select(
                    CompetencyClaim.claim_ref
                ).where(
                    CompetencyClaim.status
                    == "verified"
                )
            )
        ).scalars().all()
    )

    # Score fields mirror what the UI shows when an intervention is created.
    data["interventions"] = [
        {
            "id": f"INT-{item.id}",
            "topic": item.topic,
            "affectedTraineesCount": len(
                item.trainees
            ),
            "traineesList": item.trainees,
            "beforeScore": 46,
            "afterScore": 74,
            "status": "completed",
            "createdDate": display_date(
                item.created_at
            ),
            "deadline": "In 3 days",
            "trainerMessage": item.message,
            "durationMinutes": (
                item.duration_minutes
            ),
            "improvementPoints": 28,
        }
        for item in interventions
    ] + data["interventions"]

    data["trainerNotes"] = [
        {
            "id": f"NOTE-{item.id}",
            "traineeId": item.trainee_id,
            "noteText": item.note_text,
            "createdAt": (
                f"{display_date(item.created_at)}"
                f" • {display_time(item.created_at)}"
            ),
            "isPrivate": True,
        }
        for item in notes
    ] + data["trainerNotes"]

    for claim in data["competencyEvidenceClaims"]:

        if claim["id"] in verified_claims:
            claim["status"] = "verified"

    return data


@router.post(
    "/interventions"
)
async def create_intervention(
    data: InterventionRequest,
    current_user: User = Depends(
        require_role("trainer")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    intervention = Intervention(
        trainer_id=current_user.id,
        topic=data.topic,
        trainees=data.trainees,
        message=data.message,
        duration_minutes=data.duration_minutes,
    )

    db.add(intervention)

    await db.commit()

    await db.refresh(intervention)

    return {
        "status": "created",
        "id": intervention.id,
    }


@router.post(
    "/competency-claims/{claim_id}/verify"
)
async def verify_competency_claim(
    claim_id: str,
    current_user: User = Depends(
        require_role("trainer")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    claim = (
        await db.execute(
            select(CompetencyClaim).where(
                CompetencyClaim.claim_ref
                == claim_id
            )
        )
    ).scalar_one_or_none()

    if not claim:

        claim = CompetencyClaim(
            claim_ref=claim_id,
        )

        db.add(claim)

    claim.status = "verified"

    claim.trainer_id = current_user.id

    await db.commit()

    return {
        "id": claim_id,
        "status": "verified",
    }


@router.post("/notes")
async def add_note(
    data: TrainerNoteRequest,
    current_user: User = Depends(
        require_role("trainer")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    note = TrainerNote(
        trainer_id=current_user.id,
        trainee_id=data.trainee_id,
        note_text=data.note_text,
    )

    db.add(note)

    await db.commit()

    return {
        "status": "saved"
    }


@router.post(
    "/announcements"
)
async def send_announcement(
    data: AnnouncementRequest,
    current_user: User = Depends(
        require_role("trainer")
    ),
    db: AsyncSession = Depends(
        get_db
    ),
):

    announcement = Announcement(
        trainer_id=current_user.id,
        message=data.message,
    )

    db.add(announcement)

    await db.commit()

    return {
        "status": "sent"
    }


@router.post(
    "/resources"
)
async def upload_resource(
    title: str = Form(...),
    file: UploadFile | None = File(None),

    current_user: User = Depends(
        require_role("trainer")
    ),

    db: AsyncSession = Depends(
        get_db
    ),
):

    file_url = None

    if file and file.filename:

        extension = (
            Path(file.filename).suffix
        )

        filename = (
            f"{uuid4().hex}"
            f"{extension}"
        )

        path = (
            UPLOAD_DIR
            / filename
        )

        with path.open("wb") as output:

            while True:

                chunk = await file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                output.write(chunk)

        file_url = str(path)

    resource = Resource(
        trainer_id=current_user.id,
        title=title,
        file_url=file_url,
    )

    db.add(resource)

    await db.commit()

    await db.refresh(resource)

    return {
        "id": resource.id,
        "status": "uploaded",
        "title": resource.title,
        "file_url": resource.file_url,
    }