from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.restaurant import MenuItem, Restaurant
from app.schemas.restaurant import MenuItemResponse, RestaurantResponse

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.get("", response_model=list[RestaurantResponse])
def list_restaurants(db: Session = Depends(get_db)):
    return db.scalars(
        select(Restaurant).where(Restaurant.is_active == True).order_by(Restaurant.id)
    ).all()


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    return restaurant


@router.get("/{restaurant_id}/menu", response_model=list[MenuItemResponse])
def list_menu(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    return db.scalars(
        select(MenuItem)
        .where(MenuItem.restaurant_id == restaurant_id)
        .order_by(MenuItem.id)
    ).all()
