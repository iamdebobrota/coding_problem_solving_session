## Problem Statement

#### Scenario:
 You are building a student management backend using FastAPI and SQLAlchemy. Your project already has `database.py` set up with a working engine, a `Base` class, a `get_db()` function using `yield`, and a `SessionLocal`. You now need to add a new feature: a Course entity. A course has an `id` (integer, primary key), a `title` (string, max 150 characters, cannot be null), and a `course_code` (string, max 20 characters, must be unique and cannot be null). You need to create the ORM model, the Pydantic request and response schemas, and a POST API endpoint that accepts course details, writes them to the database, and returns the created course including its database-generated id.

#### Task:
 Write the complete code for:

1. The `Course` ORM model in `models.py`.
2. The `CourseCreate` request schema and `CourseResponse` response schema in `schemas.py`.
3. The `POST /courses` endpoint in `main.py` that uses the `get_db()` dependency, adds the course to the database, commits, refreshes, and returns the response.
