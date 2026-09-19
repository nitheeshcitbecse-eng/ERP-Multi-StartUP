from datetime import date, datetime, timezone

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
    UniqueConstraint,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from .database import Base


# =========================
# USERS
# =========================

class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100)
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255)
    )

    role: Mapped[str] = mapped_column(
        String(20),
        index=True,
    )

    institute: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    avatar_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )


# =========================
# NOTIFICATIONS
# =========================

class Notification(Base):

    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    message: Mapped[str] = mapped_column(
        Text
    )

    read: Mapped[bool] = mapped_column(
        default=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


# =========================
# QUIZ ATTEMPTS
# =========================

class QuizAttempt(Base):

    __tablename__ = "quiz_attempts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    trainee_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    score: Mapped[int] = mapped_column(
        Integer
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="verified",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


# =========================
# ATTENDANCE
# =========================

class Attendance(Base):

    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    trainee_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    method: Mapped[str] = mapped_column(
        String(20)
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="verified",
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


# =========================
# CAREER APPLICATIONS
# =========================

class CareerApplication(Base):

    __tablename__ = "career_applications"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    trainee_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    opportunity_id: Mapped[str] = mapped_column(
        String(100)
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="submitted",
    )


# =========================
# TRAINER INTERVENTIONS
# =========================

class Intervention(Base):

    __tablename__ = "interventions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    trainer_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    topic: Mapped[str] = mapped_column(
        String(255)
    )

    trainees: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    message: Mapped[str] = mapped_column(
        Text
    )

    duration_minutes: Mapped[int] = mapped_column(
        Integer
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


# =========================
# COMPETENCY CLAIMS
# =========================

class CompetencyClaim(Base):

    __tablename__ = "competency_claims"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    claim_ref: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )

    trainer_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
    )


# =========================
# TRAINER NOTES
# =========================

class TrainerNote(Base):

    __tablename__ = "trainer_notes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    trainer_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    trainee_id: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    note_text: Mapped[str] = mapped_column(
        Text
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


# =========================
# ANNOUNCEMENTS
# =========================

class Announcement(Base):

    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    trainer_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    message: Mapped[str] = mapped_column(
        Text
    )


# =========================
# RESOURCES
# =========================

class Resource(Base):

    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    trainer_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255)
    )

    file_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )


# =========================
# COURSES
# =========================

class Course(Base):
    """A course published by an institution admin, visible to trainees of that institute."""

    __tablename__ = "courses"

    __table_args__ = (
        UniqueConstraint(
            "institute",
            "code",
            name="uq_courses_institute_code",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    institute: Mapped[str] = mapped_column(
        String(255),
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255)
    )

    code: Mapped[str] = mapped_column(
        String(100)
    )

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    trainer_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    seats: Mapped[int] = mapped_column(
        Integer
    )

    # "draft" | "published" | "archived"; trainees only see published courses.
    status: Mapped[str] = mapped_column(
        String(20),
        default="draft",
        index=True,
    )

    # [{ "id", "title", "duration_minutes", "topics": [...] }]
    modules: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    created_by: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class CourseProgress(Base):
    """The modules a trainee has completed in one course."""

    __tablename__ = "course_progress"

    __table_args__ = (
        UniqueConstraint(
            "course_id",
            "trainee_id",
            name="uq_course_progress_trainee",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    course_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "courses.id",
            ondelete="CASCADE",
        ),
        index=True,
    )

    trainee_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
    )

    completed_modules: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


# =========================
# TIMETABLE
# =========================

class TimetableSession(Base):

    __tablename__ = "timetable_sessions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    institute: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    trainer: Mapped[str] = mapped_column(
        String(255)
    )

    room: Mapped[str] = mapped_column(
        String(100)
    )

    time_slot: Mapped[str] = mapped_column(
        String(100)
    )


# =========================
# NOMINATION CONFLICT
# =========================

class NominationConflict(Base):

    __tablename__ = "nomination_conflicts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    conflict_ref: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )

    institute: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    resolution: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="open",
    )


# =========================
# RESOURCE REQUEST
# =========================

class ResourceRequest(Base):

    __tablename__ = "resource_requests"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    institute: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    resource_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    source_institute: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="requested",
    )