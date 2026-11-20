from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import get_settings
from app.db.session import create_tables
from app.db.seed import seed_database
from app.models.order import Order, OrderItem
from app.models.payment import PaymentLedger
from app.models.reminder import AdminReminderLog
from app.models.restaurant import MenuItem, Restaurant
from app.models.review import Review
from app.models.user import User

settings = get_settings()
app = FastAPI(
    title="CampusBite API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
def startup_database() -> None:
    create_tables()
    seed_database()


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"details": detail})
