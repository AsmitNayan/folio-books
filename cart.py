"""Pricing a cart: line totals, coupon discounts and shipping (all prices in rupees)."""

from catalog import find_book

COUPONS = {"WELCOME10": 10, "READMORE": 15}  # code -> percent off
SHIPPING_FEE = 49
FREE_SHIPPING_FROM = 999
MAX_QUANTITY = 10


def quote(items, coupon=""):
    lines = []
    for item in items:
        book = find_book(item.get("id"))
        if book is None:
            continue
        quantity = min(MAX_QUANTITY, max(1, int(item.get("qty", 1))))
        lines.append(
            {
                "id": book["id"],
                "title": book["title"],
                "author": book["author"],
                "cover": book["cover"],
                "price": book["price"],
                "qty": quantity,
                "total": book["price"] * quantity,
            }
        )

    subtotal = sum(line["total"] for line in lines)
    coupon = (coupon or "").strip().upper()
    discount = 0
    if coupon:
        percent_off = COUPONS[coupon]
        discount = round(subtotal * percent_off / 100)

    after_discount = subtotal - discount
    shipping = 0 if not lines or after_discount >= FREE_SHIPPING_FROM else SHIPPING_FEE
    return {
        "lines": lines,
        "subtotal": subtotal,
        "coupon": coupon or None,
        "discount": discount,
        "shipping": shipping,
        "free_shipping_from": FREE_SHIPPING_FROM,
        "total": after_discount + shipping,
    }
