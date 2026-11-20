from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderResponse

router = APIRouter(prefix="/delivery", tags=["delivery"])


@router.get("/orders", response_model=list[OrderResponse])
def list_assigned_orders(
    db: Session = Depends(get_db),
    partner: User = Depends(require_role("DELIVERY")),
):
    return db.scalars(
        select(Order)
        .where(Order.delivery_partner_id == partner.id)
        .order_by(Order.id.desc())
    ).all()
