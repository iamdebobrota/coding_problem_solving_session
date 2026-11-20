Q: 1
Capstone Project: CampusBite — Restaurant Ordering and Delivery Platform
1. Problem Statement
Develop a full-stack restaurant ordering and delivery application named CampusBite.

The application should allow customers to browse restaurant menus, place food orders, make dummy payments, track order statuses, submit reviews and request returns or refunds after delivery.

Restaurant owners should be able to manage their restaurant menus, process incoming orders, assign delivery partners and approve or reject customer return/refund requests.

Delivery partners should be able to view their assigned orders and update their delivery status.

The application must support three primary user roles: Customer, Restaurant Owner and Delivery Partner. Each role should have access to its own dashboard and functionalities.

The application must use REST APIs for frontend-backend communication and enforce role-based access control on the backend.

Project boundaries
The following are not required:

Real payment gateway integration, UPI or payment webhooks.
Maps, GPS or live location tracking.
WebSockets or push notifications.
File uploads.
Multi-restaurant cart.
Automatic delivery partner assignment.
Embeddings or vector databases.
2. Technology Stack
Layer	Technology
Frontend	HTML, CSS, Vanilla JavaScript
Backend	Python, FastAPI
ORM	SQLAlchemy
Database	PostgreSQL (Supabase)
AI Integration	Gemini API
Frontend Deployment	Vercel
Backend Deployment	Render
3. User Roles and Functional Requirements
A. Customer
Customers should be able to:

Register and log in to the application.
Browse available restaurants and their menus.
View dish details, descriptions, prices and availability.
Add dishes to their cart and place an order from one restaurant at a time.
Complete checkout using a dummy payment mechanism.
View their order history and individual order details.
Track the current status of their orders.
Update the delivery address while the order is in PLACED status.
Cancel an order while it is in PLACED status.
Submit a food review after an order has been delivered.
Request a return/refund after an order has been delivered.
View the status of their return/refund requests.
Generate order summaries and insights using the AI functionality.
Customers must be able to access only their own orders and reviews.

B. Restaurant Owner
Restaurant owners should be able to:

Log in to their account.
Manage their restaurant menu.
Add new dishes with details such as name, description, price and image URL.
Update existing dish details and prices.
Mark dishes as available or unavailable.
View incoming orders for their restaurant.
Accept incoming orders.
Update order statuses as the food is being prepared.
Mark orders as ready for delivery.
Assign delivery partners to ready orders.
Cancel eligible orders before they reach OUT_FOR_DELIVERY.
View customer return/refund requests.
Approve or reject return/refund requests.
View order statistics and pending reminders.
Restaurant owners must only be able to manage their own restaurant's menu and orders.

C. Delivery Partner
Delivery partners should be able to:

Log in to their account.
View orders assigned to them.
View relevant order and delivery details.
Mark an assigned order as OUT_FOR_DELIVERY.
Mark an order as DELIVERED.
Delivery partners must only be able to access and update orders assigned to their accounts.

4. Authentication and Authorization
Implement authentication using JWT.

The application must provide the following authentication APIs:

POST /auth/register
POST /auth/login
GET /auth/me
Registration must be available publicly for customers only. Restaurant owners and delivery partners should be created through the seed data.

On successful login, return a JWT access token along with the user's role. For restaurant owners, also return the associated restaurant_id.

The frontend should store the authentication token and role in localStorage and send the token with every authenticated API request using:

Authorization: Bearer <token>

The backend must verify user roles and ownership before allowing access to protected resources.

Hiding UI elements based on user roles is not sufficient. All authorization checks must happen on the backend.

5. Database Requirements
Design and implement the database using SQLAlchemy and PostgreSQL.

The application should contain the following main tables:

Users
Store user information such as:

id
email (unique)
password_hash
full_name
role
restaurant_id (nullable)
profile_image_url (nullable HTTPS URL)
created_at
Restaurants
Store:

id
name
address_text
is_active
owner_user_id
Menu Items
Store:

id
restaurant_id
name
description
price_inr
is_available
image_url
created_at
Unavailable menu items should be marked using is_available = false instead of permanently deleting them. Restaurant owners must also be able to mark previously unavailable items as available again.

Orders
Store:

id
customer_id
restaurant_id
delivery_partner_id (nullable)
status
delivery_address_text
notes (nullable)
subtotal_inr
payment_status
return_status
return_reason (nullable)
return_admin_note (nullable)
placed_at
updated_at
Supported payment_status values:

mock_paid
refund_pending
refunded
Supported return_status values:

none (default)
requested
approved
rejected
Order Items
Store:

id
order_id
menu_item_id
item_name_snapshot
unit_price_snapshot
quantity
The order item name and price must be stored as snapshots so that future menu changes do not affect previous orders.

Reviews
Store:

id
order_id (unique)
customer_id
rating
comment
created_at
A customer should be allowed to submit only one review per order.

Payment Ledger
Store:

id
order_id
entry_type
amount_inr
note
created_by_user_id
created_at
Use the ledger to maintain records of dummy payments and refunds.

Supported ledger entry types:

mock_charge
refund_credit
Admin Reminder Log
Store:

id
order_id
restaurant_id
message
created_at
Establish appropriate primary keys, foreign keys and relationships between the tables.

6. Order Lifecycle and Business Rules
The application must maintain a defined order lifecycle. The backend must validate every status transition.

Use the following order statuses:

PLACED, ACCEPTED, PREPARING, READY, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED.

Valid Order Transitions
Current Status	Next Status	Responsible Role
PLACED	ACCEPTED	Restaurant Owner
PLACED	CANCELLED	Customer
ACCEPTED	PREPARING	Restaurant Owner
ACCEPTED	CANCELLED	Restaurant Owner
PREPARING	READY	Restaurant Owner
PREPARING	CANCELLED	Restaurant Owner
READY	ASSIGNED	Restaurant Owner
READY	CANCELLED	Restaurant Owner
ASSIGNED	OUT_FOR_DELIVERY	Assigned Delivery Partner
ASSIGNED	CANCELLED	Restaurant Owner
OUT_FOR_DELIVERY	DELIVERED	Assigned Delivery Partner
Business rules:

Customers can cancel orders only while they are in PLACED status.
Restaurant owners can cancel orders after accepting them, provided they have not reached OUT_FOR_DELIVERY.
Delivery partners can update only their assigned orders.
Orders in OUT_FOR_DELIVERY or DELIVERED cannot be cancelled.
Delivered orders cannot have their order items modified.
Invalid status transitions must return HTTP 409 Conflict.
CANCELLED is a terminal status.
The backend should use a common validation function, such as assert_order_transition(order, new_status, role), to enforce these rules.

Order Placement Rules
When a customer places an order, the backend must validate the following:

The cart must not be empty.
All dishes in the order must belong to the same restaurant.
All selected dishes must be available.
The order subtotal must be calculated on the backend using the current menu prices, not a subtotal supplied by the frontend.
7. Dummy Payment and Refund Management
Dummy Payment
Real payment gateway integration is not required.

When an order is successfully placed:

Create the order and its order items.
Calculate and store the order subtotal using current menu prices.
Set payment_status = mock_paid.
Insert a payment ledger entry with entry_type = mock_charge.
Store the order subtotal as the ledger amount.
The ledger entry should contain the note:

Dummy payment – no gateway

Customer Return Request
Customers can request a return only after an order reaches DELIVERED.

Implement:

POST /orders/{id}/return-request

Request body:

{ "reason": "Reason for requesting a return" }

Rules:

The customer must own the order.
The order must be in DELIVERED status.
Only one return request is permitted per order.
Store the reason in orders.return_reason.
Set return_status = requested.
Restaurant Owner Return Decision
Implement:

POST /restaurant/orders/{id}/return-decision

Request body:

{ "decision": "approve", "admin_note": "Decision details" }

The owner can approve or reject the request.

Rules:

Only the restaurant owner associated with the order can make the decision.
The order must have return_status = requested.
A repeated decision request must return HTTP 409 Conflict.
Save the decision note in orders.return_admin_note.
When approved:

Set return_status = approved.
Set payment_status = refund_pending.
Process the dummy full refund immediately.
Set payment_status = refunded.
Insert a refund_credit entry in the payment ledger for the full order subtotal.
When rejected:

Set return_status = rejected.
Keep payment_status = mock_paid.
Save the owner's decision note.
The delivered order status should remain DELIVERED. Return and refund information should be maintained separately through return_status and payment_status.

Cancellation Refunds
When an order is cancelled by a customer while PLACED, or by a restaurant owner before OUT_FOR_DELIVERY, create a full dummy refund ledger entry and set payment_status = refunded.

No actual money transfer is required.

8. Dashboard Requirements
Customer Dashboard
Display the customer's orders with:

Order ID and status.
Payment status.
Return status.
Order total.
Order placement date.
Provide the following filters:

status
from_date
to_date
payment_status
Available actions:

Cancel eligible orders.
Track orders.
Submit reviews after delivery.
Request returns after delivery.
Restaurant Owner Dashboard
Display the restaurant's order queue from PLACED through READY.

Also display delivered orders with pending return requests so the owner can review and decide those requests.

Provide the following filters:

status
from_date
to_date
assigned
return_status
Available actions:

Accept orders.
Update preparation status.
Mark orders ready.
Assign delivery partners.
Cancel eligible orders.
Approve or reject return requests.
Manage menu items.
Provide a dropdown containing the seeded delivery partner accounts for assignment. Separate delivery partner availability tracking is not required.

Delivery Partner Dashboard
Display only the delivery partner's assigned orders.

Provide the following filters:

status
today (based on the order's placed_at date)
page
limit
Available actions:

Start delivery.
Mark order as delivered.
Dashboards can refresh manually or through a page reload. Real-time updates are not required.

All dashboard list APIs must support pagination through page and limit query parameters.

9. AI-Powered Order Insights
Integrate Gemini to provide customers with summaries and insights about their own order history.

Implement:

POST /ai/orders/insights

Request body:

{ "prompt_type": "summary", "question": "Summarise my last 5 orders" }

Supported prompt types:

summary
insights
Backend workflow:

Authenticate the customer.
Fetch only that customer's orders and order items from the database.
Prepare order information such as order IDs, dates, statuses, items and totals.
Send the prepared order context to Gemini.
Ensure the model answers only from the supplied order context.
Return the generated answer to the frontend.
Example questions:

Summarise my last 5 orders.
Which of my orders are still not delivered?
How much did I spend this week?
The AI integration must not access or expose another customer's order data.

The AI API should be rate limited, for example, to 10 requests per hour per user.

The Gemini API key must be stored in the backend environment variables and must not be exposed in frontend code.

Embeddings, vector databases, autonomous ordering and streaming responses are not required.

10. Background Reminders
Implement a reminder mechanism for restaurant owners when orders remain without updates.

Use FastAPI BackgroundTasks.

The system should identify orders that:

Are in PLACED or ACCEPTED status.
Have not been updated for more than 15 minutes.
When a matching order is found:

Create a reminder entry in admin_reminder_log.
Create at most one reminder record per order to avoid duplicate reminders on repeated checks.
Make the reminders available through GET /restaurant/reminders.
Display the reminders on the restaurant owner's dashboard.
Push notifications and WebSockets are not required.

11. API Requirements
Implement the following REST API endpoints:

Method	Endpoint	Access
POST	/auth/register	Public — customers only
POST	/auth/login	Public
GET	/auth/me	Authenticated users
GET	/restaurants	Public
GET	/restaurants/{id}/menu	Public
GET	/restaurants/{id}/stats	Public — average restaurant rating
POST	/restaurant/menu-items	Restaurant Owner
PATCH	/restaurant/menu-items/{id}	Restaurant Owner
POST	/orders	Customer
GET	/orders/me	Customer
GET	/orders/{id}	Customer — own order
PATCH	/orders/{id}	Customer — update delivery address while PLACED
PATCH	/orders/{id}/cancel	Customer — PLACED only
POST	/orders/{id}/review	Customer
POST	/orders/{id}/return-request	Customer
GET	/restaurant/delivery-partners	Restaurant Owner
GET	/restaurant/stats	Restaurant Owner — today's order counts grouped by status
GET	/restaurant/reminders	Restaurant Owner
GET	/restaurant/orders	Restaurant Owner
PATCH	/restaurant/orders/{id}/status	Restaurant Owner
PATCH	/restaurant/orders/{id}/assign	Restaurant Owner
POST	/restaurant/orders/{id}/return-decision	Restaurant Owner
GET	/delivery/orders	Delivery Partner
PATCH	/delivery/orders/{id}/status	Delivery Partner
POST	/ai/orders/insights	Customer
GET	/health	Public
Query Parameters
Restaurant menu

GET /restaurants/{id}/menu

q — Search dishes by name.
max_price — Filter dishes by maximum price.
Customer order list

GET /orders/me

status
from_date
to_date
payment_status
page
limit
Restaurant order list

GET /restaurant/orders

status
from_date
to_date
assigned
return_status
page
limit
Delivery partner order list

GET /delivery/orders

status
today — Filters orders using their placed_at date.
page
limit
Restaurant Statistics
GET /restaurants/{id}/stats

This public endpoint should return the restaurant's average customer rating based on submitted reviews.

GET /restaurant/stats

This restaurant-owner endpoint should return the count of orders grouped by status for the current day, based on placed_at.

Restaurant Delivery Partner List
GET /restaurant/delivery-partners

Return the seeded delivery partner accounts for the restaurant owner's assignment dropdown.

Additional API Requirements
PATCH /orders/{id} must update only the delivery address and only while the order is PLACED.
Customers cannot change order items or subtotal after order placement.
Restaurant owners must use /restaurant/orders/{id}/status for normal status changes and eligible cancellations.
Return decisions must be rejected with 409 Conflict unless the return status is requested.
Every protected endpoint must enforce role-based access and record ownership.
APIs must return appropriate HTTP status codes for authentication, authorization, validation and business rule failures.
12. Middleware, Validation and Security
Implement the following:

FastAPI middleware to log the HTTP method, request path and request execution time.
Rate limiting for authentication and AI routes.
JWT expiry handling.
CORS configuration restricted to the frontend origin.
Password hashing before storing passwords.
Pydantic validation for request data.
Rating validation between 1 and 5.
Quantity validation with a minimum value of 1.
HTTPS validation for profile image URLs.
Proper error handling for 401, 403, 404, 409, 422 and 429 responses.
The frontend must clear the stored token when an authenticated request returns HTTP 401.

13. Deployment Requirements
Deploy the application using:

Frontend: Vercel.
Backend: Render.
Database: Supabase PostgreSQL.
Configure the required environment variables:

Frontend

API_BASE_URL
Backend

DATABASE_URL
JWT_SECRET
GEMINI_API_KEY
CORS_ORIGINS
The backend must use the production database connection string, and the frontend must communicate with the deployed backend URL.

Do not commit passwords, API keys, database credentials or JWT secrets to the GitHub repository.

14. Expected Project Deliverables
Submit the following:

GitHub repository containing the frontend and backend source code.
Database implementation with the required tables and relationships.
Working customer, restaurant owner and delivery partner dashboards.
Functional REST APIs with authentication and role-based authorization.
Order placement, dummy payment, delivery, review and return/refund workflows.
Gemini-powered customer order summaries and insights.
Background reminder functionality.
Deployed frontend URL.
Backend API documentation URL.
README containing setup instructions, environment variables and seeded demo account details.
A short demonstration covering the main application workflows.

15. Project Acceptance Criteria
The project will be considered complete when the following end-to-end flow works:

A customer logs in, browses a restaurant menu and places an order.
The backend validates that the cart is not empty, all dishes belong to one restaurant and all selected dishes are available.
The system calculates the subtotal using current menu prices and creates the order with PLACED status and mock_paid payment status.
A dummy charge is recorded in the payment ledger.
A restaurant owner accepts the order and moves it through PREPARING and READY.
The restaurant owner assigns a delivery partner.
The delivery partner marks the order OUT_FOR_DELIVERY and then DELIVERED.
The customer submits a review.
The customer requests a return and provides a reason.
The restaurant owner approves the return request.
The system updates the return and payment statuses and creates a full refund ledger entry.
Attempting to approve the same return request again must return 409 Conflict.
Attempting to cancel the delivered order must return 409 Conflict.
Customers, restaurant owners and delivery partners must not be able to access records belonging to other users.
Restaurant menu search, maximum-price filtering and dashboard filters must work.
Restaurant statistics and customer-facing average ratings must be returned by their respective APIs.
Dashboard pagination, AI insights and background reminders must work as specified.
Important: This project uses dummy payment and refund records only. It does not process actual financial transactions.