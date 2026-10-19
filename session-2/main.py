from fastapi import FastAPI
from routes.book_router import book_router


app = FastAPI(
    title="Library Management System",
    description="A simple library management system",
    version="1.0.0"
)

app.include_router(book_router, prefix="/books")

@app.get("/")
def read_root():
    return {"message": "Hey! welcome to the library management system"}

@app.get("/health")
def read_root():
    return {"message": "health check ok"}

