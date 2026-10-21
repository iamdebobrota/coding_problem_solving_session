from pydantic import BaseModel, Field, ConfigDict

class CourseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    course_code: str = Field(min_length=1, max_length=20)


class CourseResponse(BaseModel): 
    id: int
    title: str
    course_code: str

    model_config = ConfigDict(from_attributes=True)