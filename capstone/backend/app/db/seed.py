from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.enums import UserRole
from app.models.restaurant import MenuItem, Restaurant
from app.models.user import User


def seed_database() -> None:
    db = SessionLocal()
    try:
        if db.scalar(select(User).where(User.email == "customer@campusbite.com")):
            return

        customer = User(
            email="customer@campusbite.com",
            password_hash=hash_password("password123"),
            full_name="Asha Customer",
            role=UserRole.CUSTOMER,
        )
        db.add(customer)
        db.flush()

        owner_one = User(
            email="owner1@campusbite.com",
            password_hash=hash_password("password123"),
            full_name="Ravi Owner",
            role=UserRole.OWNER,
        )
        owner_two = User(
            email="owner2@campusbite.com",
            password_hash=hash_password("password123"),
            full_name="Meera Owner",
            role=UserRole.OWNER,
        )
        delivery_one = User(
            email="delivery1@campusbite.com",
            password_hash=hash_password("password123"),
            full_name="Kiran Delivery",
            role=UserRole.DELIVERY,
        )
        delivery_two = User(
            email="delivery2@campusbite.com",
            password_hash=hash_password("password123"),
            full_name="Sunil Delivery",
            role=UserRole.DELIVERY,
        )
        db.add_all([owner_one, owner_two, delivery_one, delivery_two])
        db.flush()

        restaurant_one = Restaurant(
            name="Dosa Hut",
            address_text="Block A, Campus Food Court",
            is_active=True,
            owner_user_id=owner_one.id,
        )
        restaurant_two = Restaurant(
            name="Pizza Point",
            address_text="Near Main Gate",
            is_active=True,
            owner_user_id=owner_two.id,
        )
        db.add_all([restaurant_one, restaurant_two])
        db.flush()

        owner_one.restaurant_id = restaurant_one.id
        owner_two.restaurant_id = restaurant_two.id

        db.add_all([
            MenuItem(restaurant_id=restaurant_one.id, name="Masala Dosa", description="Crispy dosa with potato filling", price_inr=80, is_available=True),
            MenuItem(restaurant_id=restaurant_one.id, name="Idli (2 pcs)", description="Soft idli with chutney and sambar", price_inr=40, is_available=True),
            MenuItem(restaurant_id=restaurant_one.id, name="Filter Coffee", description="Strong South Indian coffee", price_inr=25, is_available=True),
            MenuItem(restaurant_id=restaurant_two.id, name="Margherita Pizza", description="Cheese and tomato", price_inr=199, is_available=True),
            MenuItem(restaurant_id=restaurant_two.id, name="Garlic Bread", description="With cheese dip", price_inr=119, is_available=True),
        ])
        db.commit()
    finally:
        db.close()
