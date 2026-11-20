from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.enums import OrderStatus, UserRole
from app.models.order import Order
from app.models.user import User
from app.schemas.order import AssignDeliveryRequest, OrderResponse
from app.services.order_service import InvalidTransitionError, transition_order
from app.services.reminder_service import run_reminder_scan

router = APIRouter(prefix="/owner", tags=["owner"])


@router.get("/orders", response_model=list[OrderResponse])
def list_restaurant_orders(
    db: Session = Depends(get_db),
    owner: User = Depends(require_role("OWNER")),
):
    if owner.restaurant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner is not linked to a restaurant")
    return db.scalars(
        select(Order)
        .where(Order.restaurant_id == owner.restaurant_id)
        .order_by(Order.id.desc())
    ).all()


@router.post("/orders/{order_id}/assign", response_model=OrderResponse)
def assign_delivery_partner(
    order_id: int,
    payload: AssignDeliveryRequest,
    db: Session = Depends(get_db),
    owner: User = Depends(require_role("OWNER")),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if owner.restaurant_id is None or order.restaurant_id != owner.restaurant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This order belongs to another restaurant")

    partner = db.get(User, payload.delivery_partner_id)
    if not partner or partner.role != UserRole.DELIVERY:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid delivery partner")

    order.delivery_partner_id = partner.id
    try:
        return transition_order(db, order, OrderStatus.ASSIGNED, owner)
    except InvalidTransitionError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/reminders/run")
def run_order_reminders(
    db: Session = Depends(get_db),
    owner: User = Depends(require_role("OWNER")),
):
    if owner.restaurant_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner is not linked to a restaurant")
    reminders = run_reminder_scan(db)
    restaurant_reminders = [
        {
            "id": reminder.id,
            "order_id": reminder.order_id,
            "restaurant_id": reminder.restaurant_id,
            "message": reminder.message,
            "created_at": reminder.created_at,
        }
        for reminder in reminders
        if reminder.restaurant_id == owner.restaurant_id
    ]
    return {"items": restaurant_reminders, "count": len(restaurant_reminders)}
