from fastapi import APIRouter

from app.api.v1.endpoints.agents import router as agents_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.fraud import router as fraud_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.investigations import router as investigations_router
from app.api.v1.endpoints.map import router as map_router
from app.api.v1.endpoints.municipal import router as municipal_router
from app.api.v1.endpoints.properties import router as properties_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.wards import router as wards_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, tags=["auth"])
api_router.include_router(users_router, tags=["users"])
api_router.include_router(wards_router, tags=["wards"])
api_router.include_router(properties_router, tags=["properties"])
api_router.include_router(municipal_router, tags=["municipal"])
api_router.include_router(map_router, tags=["map"])
api_router.include_router(fraud_router, tags=["fraud"])
api_router.include_router(investigations_router, tags=["investigations"])
api_router.include_router(agents_router, tags=["agents"])
api_router.include_router(dashboard_router, tags=["dashboard"])
