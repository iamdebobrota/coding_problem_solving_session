from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import OrderStatus, PaymentStatus, ReturnStatus


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id"), nullable=False)
    delivery_partner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.PLACED, nullable=False)
    delivery_address_text: Mapped[str] = mapped_column(String(1024), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    subtotal_inr: Mapped[int] = mapped_column(Integer, nullable=False)
    payment_status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.MOCK_PAID, nullable=False)
    return_status: Mapped[ReturnStatus] = mapped_column(Enum(ReturnStatus), default=ReturnStatus.NONE, nullable=False)
    return_reason: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    return_admin_note: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    placed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    menu_item_id: Mapped[int] = mapped_column(ForeignKey("menu_items.id"), nullable=False)
    item_name_snapshot: Mapped[str] = mapped_column(String(255), nullable=False)
    unit_price_snapshot: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
