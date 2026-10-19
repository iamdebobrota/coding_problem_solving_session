from sqlalchemy import select
from sqlalchemy.orm import Session
from models.course import Course
from schemas.course import CourseCreate

def create_course(db: Session, data: CourseCreate) -> Course:
    course = Course(name=data.name, category=data.category)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

def get_courses(db: Session) -> list[Course]:
    return list(db.scalars(select(Course).order_by(Course.id)).all())

def get_course_by_id(db: Session, course_id: int) -> Course | None:
    return db.get(Course, course_id)