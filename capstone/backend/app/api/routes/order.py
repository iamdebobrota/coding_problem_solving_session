from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.enums import LedgerEntryType, OrderStatus, PaymentStatus, ReturnStatus, UserRole
from app.models.order import Order, OrderItem
from app.models.payment import PaymentLedger
from app.models.restaurant import MenuItem, Restaurant
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.order import OrderCreate, OrderResponse, StatusUpdateRequest
from app.services.order_service import InvalidTransitionError, transition_order
from app.utils.pagination import build_paginated_response

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("CUSTOMER")),
):
    restaurant = db.get(Restaurant, payload.restaurant_id)
    if not restaurant or not restaurant.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    order = Order(
        customer_id=current_user.id,
        restaurant_id=restaurant.id,
        status=OrderStatus.PLACED,
        delivery_address_text=payload.delivery_address_text.strip(),
        notes=payload.notes.strip() if payload.notes else None,
        subtotal_inr=0,
        payment_status=PaymentStatus.MOCK_PAID,
        return_status=ReturnStatus.NONE,
    )
    db.add(order)
    db.flush()

    subtotal = 0
    for item_payload in payload.items:
        menu_item = db.get(MenuItem, item_payload.menu_item_id)
        if (
            not menu_item
            or menu_item.restaurant_id != restaurant.id
            or not menu_item.is_available
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item {item_payload.menu_item_id} is unavailable",
            )
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            item_name_snapshot=menu_item.name,
            unit_price_snapshot=menu_item.price_inr,
            quantity=item_payload.quantity,
        )
        db.add(order_item)
        subtotal += menu_item.price_inr * item_payload.quantity

    order.subtotal_inr = subtotal
    db.add(PaymentLedger(
        order_id=order.id,
        entry_type=LedgerEntryType.MOCK_CHARGE,
        amount_inr=subtotal,
        note="Mock payment charge",
        created_by_user_id=current_user.id,
    ))
    db.commit()
    db.refresh(order)
    return order


@router.get("/mine", response_model=PaginatedResponse[OrderResponse])
def list_my_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("CUSTOMER")),
):
    base = select(Order).where(Order.customer_id == current_user.id).order_by(Order.id.desc())
    total = len(db.scalars(base).all())
    orders = db.scalars(base.offset((page - 1) * limit).limit(limit)).all()
    return build_paginated_response(orders, total, page, limit)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if current_user.role == UserRole.CUSTOMER and order.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot view this order")
    if current_user.role == UserRole.OWNER and order.restaurant_id != current_user.restaurant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot view this order")
    if current_user.role == UserRole.DELIVERY and order.delivery_partner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot view this order")

    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    try:
        return transition_order(db, order, payload.status, current_user)
    except InvalidTransitionError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
