from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from database import get_db
from schemas.student import StudentCreate, StudentResponse, StudentEmailUpdate
from services import students_service

router = APIRouter(prefix="/students", tags=["Students"])

@router.post("/", response_model=StudentResponse, status_code=201)
def create_student(payload: StudentCreate, db: Session = Depends(get_db)):
    try:
        return students_service.create_student(db, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already exists")

@router.get("/", response_model=list[StudentResponse])
def list_students(db: Session = Depends(get_db)):
    return students_service.get_students(db)

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = students_service.get_student_by_id(db, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.patch("/{student_id}/email", response_model=StudentResponse)
def update_email(
    student_id: int,
    payload: StudentEmailUpdate,
    db: Session = Depends(get_db),
):
    student = students_service.get_student_by_id(db, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    try:
        return students_service.update_student_email(db, student, str(payload.email))
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already exists")