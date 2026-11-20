
Tech Stacks:
Backend	Python, FastAPI
ORM	SQLAlchemy
Database	PostgreSQL (Supabase)



# Layers:
- main.py --> CORS
- Routes --> 404
- Dependecies --> security
- Validation --> schema-- JSON body
- Bussiness rules --> service/ 
- Database --> models/, db/session.py

# Backend folder

app/
- main.py   // start here
- core/     // settings: read the .env, security: 
    - cofing.py     // read the env and serve
    - security.py   // hash a password sign a JWT
- db/
    - session.py
    - seed.py
- models/
    - enums.py
    - user.py
    - restaurant.py
    - order.py
    - review.py
    - payment.py
    - reminder.py
- schemas/
    - common.py
    - user.py
    - restaurant.py
    - order.py
    - dashboard
- api
    - deps.py   // role, getCurrentUser
    - routes/       // list of all the routes
        - health.py     // health check route
        - restaurants.py
        - order.py
        - owner.py
        - delivery.py

services/
    - order_service.py
    - reminder_service.py
utils/          // small and generic common functions or helper functions
    - pagination.py

.env    // ignore from git
.env.example
requirement.txt



------
# users
id: (PK)
email (unique)
password_hash: (bcrypt)
full_name
role: CUSTOMER, OWNER, DELIVERY
restaurant_id (nullable) - FK -> restaurants
profile_image_url (nullable HTTPS URL) - https
created_at - timestamp


# restaurants
id: PK
name
address_text
is_active
owner_user_id: FK -> users


# menu_items
id: PK
restaurant_id:  FK -> restaurants
name
description
price_inr: > 0
is_available: boolean
image_url
created_at: timestamp

## - Unavailable menu items should be marked using is_available = false instead of permanently deleting them Restaurant owners must also be able to mark previously unavailable items as available again.

# orders
id: PK
customer_id: FK -> users
restaurant_id:  FK -> restaurants
delivery_partner_id (nullable): FK -> users, nullable
status: PLACED, ACCEPTED, PREPARING, READY, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
delivery_address_text
notes (nullable)
subtotal_inr: COMPUTED BY SERVER
payment_status: mock_paid, refunded
return_status: none. requested
return_reason (nullable)
return_admin_note (nullable)
placed_at: timestamp
updated_at: timestamp

## - Supported payment_status values:
mock_paid
refund_pending
refunded


## - Supported return_status values:
none (default)
requested
approved
rejected


# Order Items
id: PK
order_id: FK -> oders
menu_item_id: FK -> menu_items
item_name_snapshot
unit_price_snapshot
quantity
## The order item name and price must be stored as snapshots so that future menu changes do not affect previous orders.

# Reviews
id: PK
order_id (unique): FK -> orders
customer_id: FK -> users
rating:
comment:
created_at:
## A customer should be allowed to submit only one review per order.

# payment_ledger
id: PK
order_id: FK -> orders
entry_type: 
amount_inr
note
created_by_user_id: FK -> users
created_at
## Use the ledger to maintain records of dummy payments and refunds.

## Supported ledger entry types:
mock_charge
refund_credit


# admin_reminder_log
id
order_id
restaurant_id
message
created_at



# Status transition:
## Valid Order Transitions
Current Status	    Next Status	    Responsible Role
PLACED	            ACCEPTED	    Restaurant Owner
PLACED	            CANCELLED	    Customer
ACCEPTED	        PREPARING	    Restaurant Owner
ACCEPTED	        CANCELLED	    Restaurant Owner
PREPARING	        READY	        Restaurant Owner
PREPARING	        CANCELLED	    Restaurant Owner
READY	            ASSIGNED	    Restaurant Owner
READY	            CANCELLED	    Restaurant Owner
ASSIGNED	        OUT_FOR_DELIVERY	Assigned Delivery Partner
ASSIGNED	        CANCELLED	        Restaurant Owner
OUT_FOR_DELIVERY	DELIVERED	    Assigned Delivery Partner



# lists are paginated:
{
    "items" : [],
    "total: 21,
    page: 1,
    limit: 10,
    pages: 3
}

# Errors 
{
    details: ""
}