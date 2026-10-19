from sqlalchemy import func, select
from sqlalchemy.orm import Session
from models.enrollment import Enrollment
from models.student import Student
from models.course import Course

def create_enrollment(db: Session, student_id: int, course_id: int) -> Enrollment:
    enrollment = Enrollment(student_id=student_id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

def get_enrollments(db: Session) -> list[Enrollment]:
    return list(db.scalars(select(Enrollment).order_by(Enrollment.id)).all())

def find_enrollment(db: Session, student_id: int, course_id: int):
    statement = select(Enrollment).where(
        Enrollment.student_id == student_id,
        Enrollment.course_id == course_id,
    )
    return db.scalar(statement)

def delete_enrollment(db: Session, enrollment: Enrollment) -> None:
    db.delete(enrollment)
    db.commit()

# INNER JOIN: students who are enrolled in courses.
def get_enrollment_details(db: Session):
    statement = (
        select(
            Student.name.label("student_name"),
            Course.name.label("course_name"),
        )
        .join(Enrollment, Enrollment.student_id == Student.id)
        .join(Course, Enrollment.course_id == Course.id)
        .order_by(Student.name, Course.name)
    )
    return list(db.execute(statement).mappings().all())

# LEFT JOIN: students without any enrollment.
def get_students_without_courses(db: Session):
    statement = (
        select(Student.id, Student.name, Student.email)
        .outerjoin(Enrollment, Enrollment.student_id == Student.id)
        .where(Enrollment.id.is_(None))
        .order_by(Student.name)
    )
    return list(db.execute(statement).mappings().all())

# COUNT + GROUP BY: include courses with zero enrollments.
def get_course_enrollment_counts(db: Session):
    statement = (
        select(
            Course.id.label("course_id"),
            Course.name.label("course_name"),
            func.count(Enrollment.id).label("student_count"),
        )
        .outerjoin(Enrollment, Enrollment.course_id == Course.id)
        .group_by(Course.id, Course.name)
        .order_by(Course.name)
    )
    return list(db.execute(statement).mappings().all())

# HAVING: only courses with more than 10 enrollments.
def get_courses_over_10(db: Session):
    statement = (
        select(
            Course.id.label("course_id"),
            Course.name.label("course_name"),
            func.count(Enrollment.id).label("student_count"),
        )
        .join(Enrollment, Enrollment.course_id == Course.id)
        .group_by(Course.id, Course.name)
        .having(func.count(Enrollment.id) > 10)
        .order_by(func.count(Enrollment.id).desc())
    )
    return list(db.execute(statement).mappings().all())

# Bonus: highest enrollment count first; use course name to break ties.
def get_most_popular_course(db: Session):
    statement = (
        select(
            Course.id.label("course_id"),
            Course.name.label("course_name"),
            func.count(Enrollment.id).label("student_count"),
        )
        .join(Enrollment, Enrollment.course_id == Course.id)
        .group_by(Course.id, Course.name)
        .order_by(func.count(Enrollment.id).desc(), Course.name.asc())
        .limit(1)
    )
    return db.execute(statement).mappings().first()