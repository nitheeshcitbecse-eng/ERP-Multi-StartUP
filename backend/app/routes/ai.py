from fastapi import (
    APIRouter,
    Depends,
)

from ..dependencies import (
    require_role,
)

from ..models import User

from ..schemas import (
    AIChatRequest,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.post("/chat")
async def chat(
    data: AIChatRequest,

    current_user: User = Depends(
        require_role(
            "trainee",
            "trainer",
            "admin",
        )
    ),
):

    # Temporary response.
    #
    # Later this is where we connect
    # an actual LLM / AI service.

    return {

        "reply": (
            f"AI backend received: "
            f"{data.message}"
        ),

        "action_text": None,

        "action_modal": None,

        "action_tab": None,

        "evidence_badge": None,
    }