# Folio

A small online bookstore: browse classics by genre, search and sort the shelf, read a book's page and reviews, fill a
cart with coupons and free-shipping progress, check out, and look an order up again later.

Errors are reported to Sentry. Folio is the demo application for TrueAI, which turns those errors into reviewed pull
requests on this repository.

## Stack

- **API:** Python and Flask (`app.py`, `catalog.py`, `cart.py`, `orders.py`)
- **Storefront:** plain HTML, CSS and JavaScript in `public/`, with a small hash router
- **Error monitoring:** Sentry Python SDK
- **Hosting:** Vercel (Flask is detected automatically; `public/` is served as static files)

Folio takes no payments and keeps no database. A placed order is written into an order code (the order as JSON plus
an HMAC signature), so `GET /api/orders/<code>` can show it again and prove the store issued it.

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/api/genres` | The genres on the shelf |
| GET | `/api/books?q=&genre=&max_price=&sort=` | Search, filter and sort books |
| GET | `/api/books/<id>` | A book's page: rating, reviews, more in its genre |
| POST | `/api/cart/quote` | Price a cart: lines, coupon, shipping, total |
| POST | `/api/orders` | Place an order and get its order code |
| GET | `/api/orders/<code>` | Look up an order by its code |

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # then fill in the values
flask --app app run                  # http://127.0.0.1:5000
```

## Environment variables

| Name | Purpose |
|---|---|
| `SENTRY_DSN` | Sentry project DSN. Without it, errors are not reported. |
| `ORDER_SIGNING_SECRET` | Secret used to sign order codes. |

## Deploy

Import the repository in Vercel, add the environment variables above, and deploy.
