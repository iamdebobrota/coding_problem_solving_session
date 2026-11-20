from typing import Generic, List, TypeVar

from pydantic import BaseModel


T = TypeVar("T")


class ErrorResponse(BaseModel):
    details: str


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
