from sqlalchemy import select
from sqlalchemy.orm import Session
from models.student import Student
from schemas.student import StudentCreate

def create_student(db: Session, data: StudentCreate) -> Student:
    student = Student(name=data.name, email=str(data.email))
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

def get_students(db: Session) -> list[Student]:
    return list(db.scalars(select(Student).order_by(Student.id)).all())

def get_student_by_id(db: Session, student_id: int) -> Student | None:
    return db.get(Student, student_id)

def update_student_email(db: Session, student: Student, email: str) -> Student:
    student.email = email
    db.commit()
    db.refresh(student)
    return student