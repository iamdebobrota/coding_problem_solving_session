from math import ceil
from typing import Iterable, TypeVar


T = TypeVar("T")


def build_paginated_response(
    items: Iterable[T],
    total: int,
    page: int,
    limit: int,
) -> dict:
    item_list = list(items)
    return {
        "items": item_list,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": ceil(total / limit) if total else 0,
    }
