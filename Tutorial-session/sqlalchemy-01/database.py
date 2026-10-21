# database connection and session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL ="postgresql://postgres:Python%40123451234%23@db.heaxylwadcsauwbhgvbp.supabase.co:5432/postgres"

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

engine = create_engine(DATABASE_URL)

sessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()