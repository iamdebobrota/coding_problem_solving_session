from fastapi import HTTPException
from models.book import Book
from data.books import books


def get_all_books(category=None, available=None):
    result = books

    if category is not None:
        result = [
            book for book in result
            if book["category"].lower() == category.lower()
        ]
        
    if available is not None:
        result = [
            book for book in result
            if book["available"] == available
        ]

    return result



def get_book_by_id(book_id: int):
    for book in books:
        if book["id"] == book_id:
            return book

    raise HTTPException(status_code=404, detail="Book not found")



def create_book(book: Book):
    new_id = max([book.id for book in books], default=0) + 1

    new_book = {
        "id": new_id,
        **book.model_dump(),
        "available": True
    }

    books.append(new_book)
    return new_book



def update_book(book_id: int, updated_book: Book):
    for index, book in enumerate(books):
        if book["id"] == book_id:
            books[index] = {
                "id": book_id,
                **updated_book.model_dump(),
            }
            return books[index]
    raise HTTPException(status_code=404, detail="Book not found")


def delete_book(book_id: int):
    for index, book in enumerate(books):
        if book["id"] == book_id:
            deleted_book = books.pop(index)

            return {
                "message": "Book deleted successfully",
                "deleted_book": deleted_book
            }

    raise HTTPException(status_code=404, detail="Book not found")