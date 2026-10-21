from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    course_code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
