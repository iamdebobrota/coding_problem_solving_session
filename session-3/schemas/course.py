from pydantic import BaseModel, ConfigDict

class CourseCreate(BaseModel):
    name: str
    category: str

class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str