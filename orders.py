"""
Placing and looking up orders.

Folio takes no payments and keeps no database. A placed order is written
into an order code: the order as JSON, base64-encoded, plus an HMAC
signature. Anyone holding the code can see their order on the "Track an
order" page, and the signature proves this store issued it unchanged.
"""

import base64
import hashlib
import hmac
import json
import os
import re
import time
from datetime import datetime, timezone

from cart import quote

PINCODE = re.compile(r"^[1-9][0-9]{5}$")


class OrderError(Exception):
    """A problem with the customer's order that they can fix."""


def _sign(payload):
    secret = os.environ["ORDER_SIGNING_SECRET"]
    return hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()[:24]


def place_order(items, coupon, customer):
    name = (customer.get("name") or "").strip()
    email = (customer.get("email") or "").strip()
    pincode = (customer.get("pincode") or "").strip()
    if not name:
        raise OrderError("Please enter your name.")
    if "@" not in email:
        raise OrderError("Please enter a valid email address.")
    if not PINCODE.match(pincode):
        raise OrderError("Please enter a valid 6-digit pincode.")

    priced = quote(items, coupon)
    if not priced["lines"]:
        raise OrderError("Your cart is empty.")

    order = {
        "order_id": f"FOL-{int(time.time())}",
        "placed_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "name": name,
        "pincode": pincode,
        "lines": [{"title": line["title"], "qty": line["qty"], "total": line["total"]} for line in priced["lines"]],
        "discount": priced["discount"],
        "shipping": priced["shipping"],
        "total": priced["total"],
    }
    payload = base64.urlsafe_b64encode(json.dumps(order).encode()).decode().rstrip("=")
    return {**order, "code": f"{payload}.{_sign(payload)}"}


def find_order(code):
    """The order inside *code*, or None when the code is malformed or was not signed by this store."""
    payload, _, signature = code.strip().partition(".")
    if not payload or not hmac.compare_digest(signature, _sign(payload)):
        return None
    padded = payload + "=" * (-len(payload) % 4)
    try:
        return json.loads(base64.urlsafe_b64decode(padded))
    except ValueError:
        return None
