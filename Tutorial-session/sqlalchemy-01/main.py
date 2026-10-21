from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List

from database import Base, engine, get_db
from models import Course
from schemas import CourseCreate, CourseResponse

app = FastAPI(title="Course Management System", description="API for managing courses")

# create all tables in the database so sqlalchemy knows about them
Base.metadata.create_all(bind=engine)


@app.get("/")
def health_check():
    return {"status": "ok"}

@app.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(course_data: CourseCreate, db: Session = Depends(get_db)):
    new_course = Course(
        title=course_data.title,
        course_code=course_data.course_code,
    )
    try:
        db.add(new_course)
        db.commit()
        db.refresh(new_course)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course with this course code already exists",
        )
    return new_course

@app.get("/courses", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return courses