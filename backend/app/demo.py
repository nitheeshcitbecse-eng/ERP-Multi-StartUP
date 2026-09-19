"""
Demo dashboard content.

The JSON files in demo_data/ are exported from the frontend mock
data (frontend/src/data), so every dashboard response has the exact
shape the React components read. Dashboard routes start from this
content and overlay the real rows stored in PostgreSQL.
"""

import copy
import json

from datetime import datetime
from functools import lru_cache
from pathlib import Path

from .models import User


DEMO_DIR = Path(__file__).parent / "demo_data"


@lru_cache
def _load(name: str) -> dict:

    with (DEMO_DIR / f"{name}.json").open(
        encoding="utf-8"
    ) as file:

        return json.load(file)


def demo_bundle(name: str) -> dict:
    """Returns a fresh copy of a demo bundle: "trainee", "trainer" or "admin"."""

    return copy.deepcopy(_load(name))


def overlay_profile(
    profile: dict,
    user: User,
    institute_key: str = "institute",
) -> dict:
    """Replaces the demo identity with the signed-in user's own details."""

    profile.update(
        {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
        }
    )

    if user.institute:
        profile[institute_key] = user.institute

    if user.avatar_url:
        profile["avatarUrl"] = user.avatar_url

    return profile


def display_date(value: datetime) -> str:

    return value.astimezone().strftime("%d %b %Y")


def display_time(value: datetime) -> str:

    return value.astimezone().strftime("%I:%M %p")
