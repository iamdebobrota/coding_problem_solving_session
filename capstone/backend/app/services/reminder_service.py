from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.reminder import AdminReminderLog
from app.utils.datetime import utc_now


REMINDER_THRESHOLD_MINUTES = 20


def generate_owner_reminder(db: Session, order: Order) -> AdminReminderLog:
    existing = db.scalar(
        select(AdminReminderLog).where(
            AdminReminderLog.order_id == order.id,
            AdminReminderLog.message.like("%20 minutes%"),
        )
    )
    if existing:
        return existing

    reminder = AdminReminderLog(
        order_id=order.id,
        restaurant_id=order.restaurant_id,
        message=f"Order #{order.id} has been in PLACED status for more than {REMINDER_THRESHOLD_MINUTES} minutes.",
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


def run_reminder_scan(db: Session) -> list[AdminReminderLog]:
    cutoff = utc_now() - timedelta(minutes=REMINDER_THRESHOLD_MINUTES)
    stale_orders = db.scalars(
        select(Order).where(
            Order.status == OrderStatus.PLACED,
            Order.placed_at <= cutoff,
        )
    ).all()

    reminders = [generate_owner_reminder(db, order) for order in stale_orders]
    return reminders
