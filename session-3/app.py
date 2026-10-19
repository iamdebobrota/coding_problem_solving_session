from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import Base, engine
from models import Student, Course, Enrollment
from routes.student_route import router as student_router
from routes.course_route import router as course_router
from routes.enrollment_route import router as enrollment_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Course Enrollment & Analytics System",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(student_router)
app.include_router(course_router)
app.include_router(enrollment_router)

@app.get("/")
def home():
    return {"message": "Course Enrollment API is running"}