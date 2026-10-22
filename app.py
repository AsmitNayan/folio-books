"""
Folio: a small online bookstore.

A Flask API under /api, and the storefront (plain HTML, CSS and JavaScript)
in public/. Errors are reported to Sentry when SENTRY_DSN is set.
"""

import os

import sentry_sdk
from flask import Flask, jsonify, request, send_from_directory

import cart
import catalog
import orders

sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    environment=os.environ.get("VERCEL_ENV", "development"),
    release=os.environ.get("VERCEL_GIT_COMMIT_SHA"),
    send_default_pii=False,
)

app = Flask(__name__, static_folder="public", static_url_path="")


@app.get("/")
def storefront():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/genres")
def list_genres():
    return jsonify(genres=catalog.GENRES)


@app.get("/api/books")
def list_books():
    query = request.args.get("q", "")
    genre = request.args.get("genre") or None
    sort = request.args.get("sort", "featured")
    max_price = request.args.get("max_price")
    if max_price is not None:
        max_price = float(max_price)
    books = catalog.browse(query, genre, max_price, sort)
    return jsonify(books=[catalog.summary(book) for book in books])


@app.get("/api/books/<book_id>")
def get_book(book_id):
    book = catalog.find_book(book_id)
    if book is None:
        return jsonify(error="We couldn't find that book."), 404
    return jsonify(book=catalog.details(book))


@app.post("/api/cart/quote")
def quote_cart():
    body = request.get_json(silent=True) or {}
    return jsonify(cart.quote(body.get("items", []), body.get("coupon", "")))


@app.post("/api/orders")
def place_order():
    body = request.get_json(silent=True) or {}
    try:
        order = orders.place_order(body.get("items", []), body.get("coupon", ""), body.get("customer", {}))
    except orders.OrderError as error:
        return jsonify(error=str(error)), 400
    return jsonify(order=order), 201


@app.get("/api/orders/<code>")
def find_order(code):
    order = orders.find_order(code)
    if order is None:
        return jsonify(error="That order code isn't valid. Check it and try again."), 404
    return jsonify(order=order)


@app.errorhandler(500)
def server_error(error):
    # Serverless functions can be paused as soon as they respond, so send the
    # error report to Sentry before answering.
    sentry_sdk.flush(timeout=2)
    return jsonify(error="Something went wrong on our side. We've been notified."), 500


if __name__ == "__main__":
    app.run(port=5000, debug=False)
