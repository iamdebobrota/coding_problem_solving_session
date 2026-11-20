from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import OrderStatus, PaymentStatus, ReturnStatus


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    restaurant_id: int
    delivery_address_text: str = Field(min_length=3, max_length=1024)
    notes: Optional[str] = Field(default=None, max_length=1024)
    items: List[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    item_name_snapshot: str
    unit_price_snapshot: int
    quantity: int

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    restaurant_id: int
    delivery_partner_id: Optional[int] = None
    status: OrderStatus
    delivery_address_text: str
    notes: Optional[str] = None
    subtotal_inr: int
    payment_status: PaymentStatus
    return_status: ReturnStatus
    return_reason: Optional[str] = None
    return_admin_note: Optional[str] = None
    placed_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class StatusUpdateRequest(BaseModel):
    status: OrderStatus


class AssignDeliveryRequest(BaseModel):
    delivery_partner_id: int
