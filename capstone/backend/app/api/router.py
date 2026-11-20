from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.delivery import router as delivery_router
from app.api.routes.health import router as health_router
from app.api.routes.order import router as order_router
from app.api.routes.owner import router as owner_router
from app.api.routes.restaurants import router as restaurants_router


api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(order_router)
api_router.include_router(owner_router)
api_router.include_router(delivery_router)
api_router.include_router(restaurants_router)