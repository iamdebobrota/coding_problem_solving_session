from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from database import get_db
from schemas.enrollment import EnrollmentCreate, EnrollmentResponse
from services import students_service, course_service, enrollment_service

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@router.post("/", response_model=EnrollmentResponse, status_code=201)
def enroll_student(payload: EnrollmentCreate, db: Session = Depends(get_db)):
    if students_service.get_student_by_id(db, payload.student_id) is None:
        raise HTTPException(status_code=404, detail="Student not found")
    if course_service.get_course_by_id(db, payload.course_id) is None:
        raise HTTPException(status_code=404, detail="Course not found")
    if enrollment_service.find_enrollment(db, payload.student_id, payload.course_id):
        raise HTTPException(status_code=409, detail="Already enrolled in this course")
    try:
        return enrollment_service.create_enrollment(
            db, payload.student_id, payload.course_id
        )
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Enrollment already exists")

@router.get("/", response_model=list[EnrollmentResponse])
def list_enrollments(db: Session = Depends(get_db)):
    return enrollment_service.get_enrollments(db)

@router.get("/details")
def enrollment_details(db: Session = Depends(get_db)):
    return enrollment_service.get_enrollment_details(db)

@router.get("/students-without-courses")
def students_without_courses(db: Session = Depends(get_db)):
    return enrollment_service.get_students_without_courses(db)

@router.get("/course-counts")
def course_counts(db: Session = Depends(get_db)):
    return enrollment_service.get_course_enrollment_counts(db)

@router.get("/courses-over-10")
def courses_over_10(db: Session = Depends(get_db)):
    return enrollment_service.get_courses_over_10(db)

@router.get("/popular-course")
def popular_course(db: Session = Depends(get_db)):
    course = enrollment_service.get_most_popular_course(db)
    if course is None:
        return {"message": "No enrollments found"}
    return course

@router.delete("/", status_code=204)
def delete_enrollment(
    student_id: int,
    course_id: int,
    db: Session = Depends(get_db),
):
    enrollment = enrollment_service.find_enrollment(db, student_id, course_id)
    if enrollment is None:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment_service.delete_enrollment(db, enrollment)
    return None