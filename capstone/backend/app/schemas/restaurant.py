from typing import Optional

from pydantic import BaseModel


class MenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price_inr: int
    is_available: bool
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}


class RestaurantResponse(BaseModel):
    id: int
    name: str
    address_text: str
    is_active: bool
    owner_user_id: int

    model_config = {"from_attributes": True}
