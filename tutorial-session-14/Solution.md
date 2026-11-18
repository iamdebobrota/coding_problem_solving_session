

CampusPrint Design Document

Section 1 - Goals
- G1 (R1): students browse print shops and their price lists, place print jobs and pay.
- G2 (R2): Students track each print job and see its current status.
- G3 (R3): Students rate a delivered job from 1 to 5 and add a comment.
- G4 (R4): Shop owners manage their shop's price list and see incoming jobs.
- G5 (R5): Shop owners assign a runner (the delivery partner) to each job.
- G6 (R6): Runners view the jobs assigned to them and update the delivery status.
- G7 (R7): Shop owners get a reminder in the website's notification bell when a job has no status update for 60 minutes.



Section 2 - Non-goals
- [unapproved proposal]: [one-line reason]

- Real payment gateway integration: The current scope only records payment details and does not process payment through an external gateway.
- Live GPS tracking of runners: 
- One cart holding jobs from two different shops: 
- Auto-assigning runners to jobs: THe shop owner assigns a runner manually under R5
- Push notifications to phones: R7 requires reminders only the websites notification bell.




# Database design
Section 3 - Tables
Table: users (serves [R numbers])
- [column]: [type or constraint] - [purpose]


## Table: users (serves R1 - R7)
Use one users table for students, sho owners, and runners. the role column tells us each user;s role

- id: BIGINT, primary key - user ID.
- name: VARCHAR(100), required - user's name.
- email: VARCHAR(255), unique - user's email.
- password_hash: VARCHAR(255), required - secure password.
- role: VARCHAR(20), required - student, shop_owner, or runner.

## Table: shops (serves R1, R4, R5, R7)
- id: BIGINT, primary key - shop ID.
- owner_id: BIGINT, foreign key to users.id, unqiue - shop owner
- name: VARCHAR(100), required - shop name.
- address: Text, required - shop address.

## Table: shop_price_items (serves R1 R4)
- id: BIGINT, primary key - price item ID.
- shop_id: BIGINT, foreign key to shop.id - shop that offers the service
- item_name: VARCHAR(100), required - print service name.
- unit_price: DECIMAL(10, 2), required - price per unit

## Table: print_jobs (serves R1 R4)
- id: BIGINT, primary key - job ID.
- students_id: BIGINT, foreign key to users.id  - students who places the job.
- shop_id: BIGINT, foreign key to shop.id - shop that will print the job.
- runner_id: BIGINT, foreign key to users.id, can be empty  - assinged runner.
- status: VARCHAR(30) (enum: PRINTED/ASSIGNED_RUNNER/DISPATCH/OUT_OF_DELIVERY/DELIVERED), required - current job status
- total_amount:  DECIMAL(10, 2), required - total job price.
- status_updated_at: TIMESTAMP, required - time of the last status updated at.

## Table: print_job_items (serves)
- id: BIGINT, primary key - print_job_items ID.
- job_id: BIGINT, foreign key to print_jobs.id - related job.
- item_name: VARCHAR(100), required - selected print service.
- quantity: INTEGER, required - number of pages or copies
- unit_price: DECIMAL(10, 2), required - price per unit


## Table: payment (serves)
- id: BIGINT, primary key - payment ID.
- job_id: BIGINT, foreign key to print_jobs.id - related job.
- amount: DECIMAL(10, 2), required - amount recorded.
- status: VARCHAR(30) (enum: pending.paid, or failed), required
- payment_method: VARCHAR(30), requied - selected payment method.



## Table: reviews (serves R3)
- id: integer, primary key - review ID
- job_id: foreign key to print_jobs - which job was reviewed
- student_id: foreign key to users.id - who wrote the review
- rating: integer, 1 to 5 - the score given
- comment: string - review text
- created_at: timestamp - when the review was created

## Table: notifications (serves R3)
- id: integer, primary key - notification ID.
- recipient_user_id: foreign key to user.id - shop owner who recieve it.
- job_id: foreign key to print_jobs - which job was reviewed
- message: VARCHAR(100), required - reminder message.
- is_read: BOOLEAN, default: false - wheather the owner read it or not.
- created_at: TIMESTAMP, required - time the reminder was created.


# Section 4 - Job lifecycle
- Invalid move the server rejects: [example and why]

- One user can place many prints jobs.
- one shop owner can own a shop.
- one shop can have many prince items.
- one shopcan recieve many print jobs.
- One print job can have many print job items.
- one runner can receive many print jobs
- One print job can have one payment and one review.
- One shop owner can receive many notifications.

----
- Valid order: [status] -> [status] -> ...

NEW -> ASSIGNED -> OUT_OF_DELIVERY -> DELIVERED




---------


User enter password -> frontend -> accept password in backend -> Test@123 -> ""
    |
Salt the password - extra unique and random string - (rainbow attack, ensures unique hashes)
    |
Hash the password - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    |
DB


-----


FLOAT vs DECIMAL

- approximate
- exact

example: 
- 10.999999999999
- 10.99