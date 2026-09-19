from datetime import date
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)


# =========================
# AUTH
# =========================

class SignupRequest(BaseModel):

    name: str
    email: EmailStr
    password: str
    role: str
    institute: str | None = None


class LoginRequest(BaseModel):

    email: EmailStr
    password: str
    role: str


class UserResponse(BaseModel):

    id: int
    name: str
    email: EmailStr
    role: str
    institute: str | None = None
    avatar_url: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


class AuthResponse(BaseModel):

    access_token: str
    token_type: str
    user: UserResponse


# =========================
# TRAINEE
# =========================

class BoosterQuizRequest(BaseModel):

    score: int


class AttendanceRequest(BaseModel):

    method: str


class CareerApplicationRequest(BaseModel):

    opportunity_id: str


# =========================
# TRAINER
# =========================

class InterventionRequest(BaseModel):

    topic: str
    trainees: list[str]
    message: str
    duration_minutes: int


class TrainerNoteRequest(BaseModel):

    trainee_id: str
    note_text: str


class AnnouncementRequest(BaseModel):

    message: str


# =========================
# ADMIN
# =========================

class CourseModuleRequest(BaseModel):

    # Sent back for existing modules so trainee progress is kept across edits.
    id: str | None = None
    title: str = Field(min_length=1, max_length=200)
    duration_minutes: int = Field(default=30, ge=1, le=1440)
    topics: list[str] = Field(default_factory=list, max_length=20)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError("Module title is required")

        return value

    @field_validator("topics")
    @classmethod
    def clean_topics(cls, value: list[str]) -> list[str]:

        return [
            topic.strip()[:100]
            for topic in value
            if topic.strip()
        ]


class CourseRequest(BaseModel):

    title: str = Field(min_length=1, max_length=255)
    code: str = Field(min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, max_length=5000)
    trainer_name: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    seats: int = Field(ge=1, le=10000)
    status: Literal["draft", "published", "archived"] = "draft"
    modules: list[CourseModuleRequest] = Field(default_factory=list, max_length=100)

    @field_validator("title", "code")
    @classmethod
    def required_text(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError("This field is required")

        return value

    @field_validator("category", "description", "trainer_name")
    @classmethod
    def optional_text(cls, value: str | None) -> str | None:

        if value is None:
            return None

        return value.strip() or None

    @model_validator(mode="after")
    def check_dates(self):

        if (
            self.start_date
            and self.end_date
            and self.end_date < self.start_date
        ):
            raise ValueError("End date must be on or after the start date")

        return self


class SessionRequest(BaseModel):

    trainer: str
    room: str
    time_slot: str


class ConflictResolutionRequest(BaseModel):

    resolution: str


class ResourceRequestBody(BaseModel):

    resource_id: str | None = None
    source_institute: str | None = None
    note: str | None = None


# =========================
# AI
# =========================

class AIChatRequest(BaseModel):

    role: str
    message: str
    language: str


# =========================
# SYNC
# =========================

class OfflineSyncRequest(BaseModel):

    records: list