### **Build a Course Enrollment & Analytics System**

### Interview Scenario

You are working on the backend of a learning platform. The team wants a small database system to manage **students, courses, and enrollments**.

The system should allow the application to:

- Add and update students
- Add courses
- Enroll students in courses
- View enrollment information
- Find students who are not enrolled in any course
- Generate basic course-wise enrollment statistics

You can use **Supabase + SQLAlchemy** for the application.

---

### Database Structure

Create these three tables:

#### `students`

```
id
name
email
```

#### `courses`

```
id
name
category
```

#### `enrollments`

```
id
student_id
course_id
```

The relationships are:

```
Student 1 ────────< Enrollment >──────── 1 Course
```

A student can enroll in multiple courses, and a course can have multiple students.

---

### Requirements

#### 1. Create the SQLAlchemy Models

Create models for:

- `Student`
- `Course`
- `Enrollment`

Set up the appropriate relationships and foreign keys.

---

#### 2. Add Student & Course

Implement functionality to:

- Add a new student.
- Add a new course.

For example:

```
Student:
Aman | aman@example.com

Course:
Python Backend | Backend
```

---

#### 3. Enroll a Student

Create functionality to enroll an existing student into an existing course.

For example:

```
Student: Aman
Course: Python Backend
```

Store this relationship in the `enrollments` table.

---

#### 4. Update Student Information

Implement functionality to update an existing student's email.

Example:

```
Old: aman@gmail.com
New: aman@example.com
```

The update should affect only the requested student.

---

#### 5. Delete an Enrollment

Implement functionality to remove a student's enrollment from a course.

For example:

```
Aman → Python Backend
```

After deletion, Aman should no longer be enrolled in that course.

---

#### 6. Write an INNER JOIN Query

Write a SQL query that returns:

```
Student Name | Course Name
```

for every student who is enrolled in a course.

Example:

```
Aman    | Python Backend
Rahul   | SQL
Aman    | SQL
```

---

#### 7. Write a LEFT JOIN Query

Write a query to find **students who are not enrolled in any course**.

Expected output:

```
Student Name
------------
Priya
```

---

#### 8. Course-wise Enrollment Count

Write a query using:

- `COUNT()`
- `GROUP BY`

to produce:

```
Course Name | Number of Students
```

Example:

```
Python Backend | 15
SQL            | 22
React          | 18
```

---

#### 9. Filter the Aggregated Result

Modify the previous query so that only courses having **more than 10 students** are returned.

Use `HAVING`.

---

### Bonus — Only if Time Permits

Find the **most popular course** based on the number of enrolled students.

Expected output:

```
Course Name | Number of Students
```

with only the course having the highest enrollment.

---

### Expected Concepts

The student should naturally demonstrate:

- SQL `UPDATE`
- SQL `DELETE`
- `WHERE`
- One-to-many / many-to-many relationships
- `INNER JOIN`
- `LEFT JOIN`
- `COUNT()`
- `GROUP BY`
- `HAVING`
- SQLAlchemy models
- Foreign keys
- SQLAlchemy relationships
- SQLAlchemy CRUD operations
- Basic ORM queries


You can use **SQLite + SQLAlchemy** for the application, to understand how local db works.
