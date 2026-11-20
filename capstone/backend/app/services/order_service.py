from sqlalchemy.orm import Session

from app.models.enums import OrderStatus, UserRole
from app.models.order import Order
from app.models.user import User


VALID_TRANSITIONS = {
    OrderStatus.PLACED: {
        OrderStatus.ACCEPTED: UserRole.OWNER,
        OrderStatus.CANCELLED: UserRole.CUSTOMER,
    },
    OrderStatus.ACCEPTED: {
        OrderStatus.PREPARING: UserRole.OWNER,
        OrderStatus.CANCELLED: UserRole.OWNER,
    },
    OrderStatus.PREPARING: {
        OrderStatus.READY: UserRole.OWNER,
        OrderStatus.CANCELLED: UserRole.OWNER,
    },
    OrderStatus.READY: {
        OrderStatus.ASSIGNED: UserRole.OWNER,
        OrderStatus.CANCELLED: UserRole.OWNER,
    },
    OrderStatus.ASSIGNED: {
        OrderStatus.OUT_FOR_DELIVERY: UserRole.DELIVERY,
        OrderStatus.CANCELLED: UserRole.OWNER,
    },
    OrderStatus.OUT_FOR_DELIVERY: {
        OrderStatus.DELIVERED: UserRole.DELIVERY,
    },
}


class InvalidTransitionError(ValueError):
    pass


def transition_order(
    db: Session,
    order: Order,
    next_status: OrderStatus,
    actor: User,
) -> Order:
    allowed = VALID_TRANSITIONS.get(order.status, {})
    responsible_role = allowed.get(next_status)

    if responsible_role is None:
        raise InvalidTransitionError(
            f"Order cannot transition from {order.status.value} to {next_status.value}"
        )
    if actor.role != responsible_role:
        raise InvalidTransitionError(
            f"{responsible_role.value} role is responsible for this transition"
        )

    if next_status == OrderStatus.ASSIGNED:
        if order.delivery_partner_id is None:
            raise InvalidTransitionError("A delivery partner must be assigned")

    if next_status == OrderStatus.OUT_FOR_DELIVERY:
        if order.delivery_partner_id != actor.id:
            raise InvalidTransitionError("This order is not assigned to the delivery partner")

    if next_status == OrderStatus.DELIVERED:
        if order.delivery_partner_id != actor.id:
            raise InvalidTransitionError("This order is not assigned to the delivery partner")

    if actor.role == UserRole.CUSTOMER and order.customer_id != actor.id:
        raise InvalidTransitionError("This order belongs to another customer")

    if actor.role == UserRole.OWNER and order.restaurant_id != actor.restaurant_id:
        raise InvalidTransitionError("This order belongs to another restaurant")

    order.status = next_status
    db.commit()
    db.refresh(order)
    return order
