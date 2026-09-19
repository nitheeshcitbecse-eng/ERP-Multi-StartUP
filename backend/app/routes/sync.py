from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    APIRouter,
    Depends,
)

from ..dependencies import (
    require_role,
)

from ..models import User

from ..schemas import (
    OfflineSyncRequest,
)


router = APIRouter(
    prefix="/sync",
    tags=["Offline Sync"],
)


@router.post("")
async def sync_offline_records(
    data: OfflineSyncRequest,

    current_user: User = Depends(
        require_role(
            "trainee",
            "trainer",
            "admin",
        )
    ),
):

    # This is the initial sync contract.
    #
    # Later we will process each record
    # and save it into the appropriate
    # PostgreSQL table.

    return {

        "synced": len(
            data.records
        ),

        "last_synced_at": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),
    }