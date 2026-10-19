import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


load_dotenv()

DATABASE_URL=os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing. add your supabase URL to .env")

engine = create_engine(DATABASE_URL)

SesionLocal = sessionmaker(
    bind=engine, # connect the session to your db engine
    autoflush=False, # prevent unnecessary queries before changes
    autocommit=False # trasaction
)


class Base(DeclarativeBase):
    pass

def get_db():
    db = SesionLocal()
    try: 
        return db
    finally:
        db.close()
