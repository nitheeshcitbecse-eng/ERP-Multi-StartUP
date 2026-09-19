# Backend Integration (FastAPI)

The frontend talks to the backend only through `src/services/api.js`, which holds the configuration, token storage and HTTP client followed by every endpoint call. Every endpoint function has a mock branch and an API branch; flipping one environment variable switches the whole app from mock data to your FastAPI server.

## 1. Switch the frontend to the API

`frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=false
```

Restart `npm run dev` after changing `.env`.

## 2. Allow the frontend origin (CORS)

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # add your deployed frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 3. Conventions the client expects

| Topic | Expectation |
|---|---|
| Base path | All routes below are relative to `VITE_API_BASE_URL` (e.g. `/api`). |
| Auth | Login/signup return `{ access_token, token_type: "bearer", user }`. The client stores the token and sends `Authorization: Bearer <token>` on every request. |
| Current user | `user = { id, name, email, role, institute, avatar_url }`, where `role` is `"trainee"`, `"trainer"` or `"admin"`. The role decides which portal opens. |
| Errors | Standard FastAPI errors: `{"detail": "message"}` or validation lists. The message is shown to the user (e.g. on the sign-in form). |
| 401 | Any 401 on an authenticated request signs the user out. |
| Request bodies | JSON, snake_case. |
| Dashboard responses | camelCase keys matching the mock data (see §5), because the UI components read those names directly. Use Pydantic `alias_generator=to_camel` with `populate_by_name=True`, or return dicts with these keys. |

## 4. Endpoints

### Auth — `api.js → authService`

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password, role }` | `{ access_token, token_type, user }` |
| POST | `/auth/signup` | `{ name, email, password, role, institute }` | `{ access_token, token_type, user }` |
| GET | `/auth/me` | — | `user` (used to restore a session on page load) |
| POST | `/auth/logout` | — | `204` |

### Trainee — `api.js → traineeService`

| Method | Path | Body | Used by |
|---|---|---|---|
| GET | `/trainee/dashboard` | — | All trainee pages (§5) |
| PATCH | `/trainee/notifications/{id}/read` | — | Notifications page |
| POST | `/trainee/booster-quiz` | `{ score }` | Booster quiz dialog |
| POST | `/attendance/check-in` | `{ method: "face" \| "qr" }` | Face ID attendance dialog |
| POST | `/trainee/career-applications` | `{ opportunity_id }` | Career opportunity dialog |
| GET | `/trainee/courses` | — | Refreshes *My Courses* after an admin edits courses |
| POST | `/trainee/courses/{id}/modules/{module_id}/complete` | — | *Mark complete* on My Courses |
| DELETE | `/trainee/courses/{id}/modules/{module_id}/complete` | — | *Mark as not done* on My Courses |

### Trainer — `api.js → trainerService`

| Method | Path | Body | Used by |
|---|---|---|---|
| GET | `/trainer/dashboard` | — | All trainer pages (§5) |
| POST | `/trainer/interventions` | `{ topic, trainees: [names], message, duration_minutes }` | Intervention wizard |
| POST | `/trainer/competency-claims/{id}/verify` | — | Competency verification |
| POST | `/trainer/notes` | `{ trainee_id, note_text }` | Trainee detail drawer |
| POST | `/trainer/announcements` | `{ message }` | Announcement dialog |
| POST | `/trainer/resources` | multipart: `title`, `file` (optional) | Upload resource dialog |

### Institution admin — `api.js → adminService`

| Method | Path | Body | Used by |
|---|---|---|---|
| GET | `/admin/dashboard?institute=` | — | All admin pages (§5) |
| GET | `/admin/courses` | — | Courses page |
| POST | `/admin/courses` | Course payload (§6) | Course editor (new) |
| PUT | `/admin/courses/{id}` | Course payload (§6) | Course editor (edit) |
| DELETE | `/admin/courses/{id}` | — | Courses page delete dialog |
| POST | `/admin/timetable/sessions` | `{ trainer, room, time_slot }` | Schedule session dialog |
| POST | `/admin/nominations/conflicts/{id}/resolve` | `{ resolution }` | Nomination conflict dialog |
| POST | `/admin/resource-requests` | `{ source_institute }` | Resource exchange dialog |

### Shared

| Method | Path | Body | Response | Service |
|---|---|---|---|---|
| POST | `/ai/chat` | `{ role, message, language }` | `{ reply, action_text?, action_modal?, action_tab?, evidence_badge? }` | `api.js → aiService` |
| POST | `/sync` | `{ records: [] }` | `{ synced, last_synced_at }` | `api.js → syncService` |

## 5. Dashboard payloads

Each dashboard endpoint returns one object. The exact field shapes are the mock files in `src/data/` — treat them as the response schema.

| Endpoint | Keys | Mock source |
|---|---|---|
| `GET /trainee/dashboard` | `trainee, hostelLogistics, nominationInfo, courses, assessments, aiRecommendation, closedLoopIntervention, certificates, attendance, careerOpportunities, careerReadiness, gamification, upcomingSchedule, notifications` | `data/mockData.js` |
| `GET /trainer/dashboard` | `trainer, batchHealth, priorityInsights, traineeRiskList, silentWeakSpots, interventions, topicHeatmap, competencyEvidenceClaims, trainerNotes` | `data/mockTrainerData.js` |
| `GET /admin/dashboard` | `admin, networkInstitutes, operationalSignals, demandSignals, adminCourses, nominationConflicts, timetableSessions, hostelBlocks, hostelAllocations, logisticsChecklist, trainerCapacity, resourceExchange` | `data/mockAdminData.js` |

For example, `mockTrainee` in `mockData.js` is the shape of `trainee`. Courses have no mock data: see §6.

Which dashboards are loaded after sign-in:

| Signed-in role | Loads | Why |
|---|---|---|
| trainee | trainee | — |
| trainer | trainer, trainee | Trainers can switch to the trainee view |
| admin | admin, trainer, trainee | Admins can switch persona |

If the primary dashboard fails, the user sees an error screen with **Try again**. Failures of the extra dashboards are logged to the console only.

## 6. Courses

Courses come only from institution admins; there is no demo course data.

- An admin creates, edits and deletes the courses of **their own institute** (`users.institute`).
- Trainees see only courses that are **published** by their institute's admin (`courses` in `GET /trainee/dashboard`). Drafts and archived courses are hidden.
- Progress is stored per trainee and module, so editing a course keeps progress for modules that still exist.

Course payload (`POST`/`PUT /admin/courses`):

```json
{
  "title": "Cooperative Accounting Essentials",
  "code": "CAE-101",
  "category": "Finance & Accounts",
  "description": "…",
  "trainer_name": "Dr. Priya Raman",
  "start_date": "2026-10-01",
  "end_date": "2026-10-31",
  "seats": 40,
  "status": "draft | published | archived",
  "modules": [{ "id": "existing id or null", "title": "Ledgers", "duration_minutes": 45, "topics": ["Double entry"] }]
}
```

Errors: `409` when the code is already used at the institute, `422` for invalid fields (for example an end date before the start date), `404` for a course of another institute.

Admin responses (`adminCourses`) use camelCase and add `id, institute, learners, schedule, createdAt, updatedAt`; `schedule` is `Unscheduled | Upcoming | Ongoing | Completed`. Trainee responses add `instructor, progress, totalModules, completedModules, remainingMinutes, nextModuleId`, and each module has `status: completed | in_progress | upcoming`.

## 7. Minimal FastAPI skeleton

```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from pydantic import BaseModel

router = APIRouter(prefix="/api")
bearer = HTTPBearer()

class LoginIn(BaseModel):
    email: str
    password: str
    role: str

@router.post("/auth/login")
def login(body: LoginIn):
    user = authenticate(body.email, body.password, body.role)     # your logic
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_jwt(user), "token_type": "bearer", "user": user}

@router.get("/trainee/dashboard")
def trainee_dashboard(creds=Depends(bearer)):
    user = current_user(creds.credentials)                      # validate JWT, check role
    return build_trainee_dashboard(user)                          # keys as in §5
```

## 8. Where to change things

| To change | Edit |
|---|---|
| API base URL / mock switch | `.env` |
| A route path or request body | `src/services/api.js` (endpoint services) |
| Token storage, headers, error parsing, timeouts | `src/services/api.js` (top of the file) |
| Which data loads after sign-in | `src/hooks/useSystemInit.js` |
