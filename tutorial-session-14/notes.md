## **Q: 1**

**1. Problem Statement:**

**Your task:** Draft a design document for CampusPrint with goals, non-goals and a database schema traced to the requirements below.

You are a back-end engineer at a campus startup. CampusPrint is a website where students order print jobs from campus print shops and runners deliver them. The product manager approved seven requirements. Your team also proposed five extra features that the product manager has not approved.

- **. Approach:**
1. Write one goal for each approved requirement and cite its number (R1 to R7).
2. Move every unapproved team proposal into the non-goals section, with a one-line reason for each.
3. Decide how one users table can hold every role and link a shop owner to their shop.
4. List the remaining tables. Give each column a type or constraint and the requirement it serves.
5. Write the valid order of job statuses and name one invalid move the server must reject.
6. Check that every table traces to a requirement and that no table supports a non-goal.

**3. Expected Output:**

Approved requirements (input):

- R1: Students browse print shops and their price lists, place print jobs and pay.
- R2: Students track each print job and see its current status.
- R3: Students rate a delivered job from 1 to 5 and add a comment.
- R4: Shop owners manage their shop's price list and see incoming jobs.
- R5: Shop owners assign a runner (the delivery partner) to each job.
- R6: Runners view the jobs assigned to them and update the delivery status.
- R7: Shop owners get a reminder in the website's notification bell when a job has no status update for 60 minutes.

Unapproved team proposals (input):

- Real payment gateway integration
- Live GPS tracking of runners
- One cart holding jobs from two different shops
- Auto-assigning runners to jobs
- Push notifications to phones

Job statuses (input): new, assigned, out for delivery, delivered.

Example of one finished block in the expected style:

```
Table: reviews (serves R3)
- id: integer, primary key - review ID
- job_id: foreign key to print_jobs - which job was reviewed
- student_id: foreign key to users.id - who wrote the review
- rating: integer, 1 to 5 - the score given
- comment: string - review text
- created_at: timestamp - when the review was created

```

**4. Starter Code:**

Use this structure for your answer:

```
CampusPrint Design Document

Section 1 - Goals
- G1 (R1): [what the system must achieve]
- G2 (R2): [what the system must achieve]
- (continue up to G7)

Section 2 - Non-goals
- [unapproved proposal]: [one-line reason]

Section 3 - Tables
Table: users (serves [R numbers])
- [column]: [type or constraint] - [purpose]

Table: [name] (serves [R numbers])
- [column]: [type or constraint] - [purpose]

Section 4 - Job lifecycle
- Valid order: [status] -> [status] -> ...
- Invalid move the server rejects: [example and why]
```

**Bonus (Optional):**

Add one more requirement, "an admin can view every shop's jobs", and state which parts of your design change and which stay the same.

**Submission Format:**

Paste your complete answer into the text box on the platform, following the structure shown in the Starter Code above.