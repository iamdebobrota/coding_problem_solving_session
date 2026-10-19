from typing import Optional

from fastapi import APIRouter
from models.book import Book

from services.book_service import (
    get_all_books,
    get_book_by_id,
    create_book,
    update_book,
    delete_book,
)

book_router = APIRouter()

@book_router.get("/")
def get_books(category: Optional[str] = None, available: Optional[bool] = None):
    return get_all_books(category, available)


@book_router.get("/{book_id}")
def get_book(book_id: int):
    return get_book_by_id(book_id)


@book_router.post("/", status_code=201)
def add_book(book: Book):
    return create_book(book)


@book_router.put("/{book_id}")
def edit_book(book_id: int, updated_book: Book):
    return update_book(book_id, updated_book)


@book_router.delete("/{book_id}", status_code=204)
def remove_book(book_id: int):
    return delete_book(book_id)