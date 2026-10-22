// Folio storefront. A small hash router (#/, #/book/<id>, #/checkout,
// #/track, #/order/<code>) renders each page from the API; the cart lives in
// localStorage and is always priced by the server.

const view = document.getElementById('view')
const toast = document.getElementById('toast')

const rupees = (amount) => `₹${amount.toLocaleString('en-IN')}`

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

// ---- API ----

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

let toastTimer
function showError(error) {
  toast.textContent = error.message
  toast.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.hidden = true), 5000)
}

// ---- Shared pieces ----

function cover(book) {
  return `
    <div class="cover" style="background:${book.cover}">
      ${book.new ? '<span class="badge">New</span>' : ''}
      <span class="cover-title">${escapeHtml(book.title)}</span>
      <span class="cover-author">${escapeHtml(book.author)}</span>
    </div>`
}

function bookCard(book) {
  return `
    <li>
      <a class="book-card" href="#/book/${book.id}">
        ${cover(book)}
        <span class="card-meta">
          <span class="title">${escapeHtml(book.title)}</span>
          <span class="row"><span>${escapeHtml(book.author)}</span><strong>${rupees(book.price)}</strong></span>
        </span>
      </a>
    </li>`
}

function shelf(books) {
  if (!books.length) return '<p class="empty">No books match that search.</p>'
  return `<ul class="shelf">${books.map(bookCard).join('')}</ul>`
}

const formatYear = (year) => (year < 0 ? `${-year} BC` : year < 1000 ? `AD ${year}` : year)

// ---- Shop ----

const shop = { genre: '' }

async function renderShop() {
  const { genres } = await api('/api/genres')
  view.innerHTML = `
    <div class="shop-head">
      <div>
        <h1>Books worth keeping</h1>
        <p>Classics in good editions, chosen one at a time.</p>
      </div>
    </div>
    <ul class="genres" id="genres">
      ${['', ...genres]
        .map((genre) => `<li><button type="button" data-genre="${genre}" aria-pressed="${genre === shop.genre}">${genre || 'All books'}</button></li>`)
        .join('')}
    </ul>
    <form class="filters" id="filters">
      <label class="search-field">Title or author<input name="q" type="search" placeholder="e.g. Wells" /></label>
      <label>Max price (₹)<input name="max_price" type="number" min="0" step="1" placeholder="Any" /></label>
      <label>Sort by
        <select name="sort">
          <option value="featured">Featured</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="newest">Newest first</option>
        </select>
      </label>
      <button class="button" type="submit">Search</button>
    </form>
    <p class="results-note" id="results-note"></p>
    <div id="shelf"></div>`

  const filters = document.getElementById('filters')
  filters.addEventListener('submit', (event) => {
    event.preventDefault()
    const params = new URLSearchParams(new FormData(filters))
    if (shop.genre) params.set('genre', shop.genre)
    loadShelf(params)
  })
  filters.sort.addEventListener('change', () => filters.requestSubmit())

  document.getElementById('genres').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-genre]')
    if (!button) return
    shop.genre = button.dataset.genre
    document.querySelectorAll('#genres button').forEach((other) => other.setAttribute('aria-pressed', other === button))
    loadShelf(new URLSearchParams(shop.genre ? { genre: shop.genre } : {}))
  })

  await loadShelf(new URLSearchParams(shop.genre ? { genre: shop.genre } : {}))
}

async function loadShelf(params) {
  try {
    const { books } = await api(`/api/books?${params}`)
    document.getElementById('shelf').innerHTML = shelf(books)
    document.getElementById('results-note').textContent = `${books.length} ${books.length === 1 ? 'book' : 'books'}`
  } catch (error) {
    showError(error)
  }
}

// ---- Book page ----

async function renderBook(id) {
  const { book } = await api(`/api/books/${encodeURIComponent(id)}`)
  view.innerHTML = `
    <a class="back" href="#/">← All books</a>
    <div class="book-page">
      ${cover(book)}
      <div class="book-info">
        <h1>${escapeHtml(book.title)}</h1>
        <p class="byline">${escapeHtml(book.author)}</p>
        <div class="facts">
          <span><strong>★ ${book.rating}</strong> · ${book.reviews.length} reviews</span>
          <span>${book.genre}</span>
          <span>${formatYear(book.year)}</span>
          <span>${book.pages} pages</span>
        </div>
        <p class="description">${escapeHtml(book.description)}</p>
        <div class="buy">
          <span class="price">${rupees(book.price)}</span>
          <button class="button" type="button" id="add-to-cart">Add to cart</button>
        </div>
      </div>
    </div>
    <h2 class="section-title">What readers say</h2>
    <ul class="reviews">
      ${book.reviews
        .map(
          (review) => `
          <li>
            <span class="stars" aria-label="${review.stars} out of 5">${'★'.repeat(review.stars)}${'☆'.repeat(5 - review.stars)}</span>
            <p>${escapeHtml(review.text)}</p>
            <span class="who">${escapeHtml(review.name)}</span>
          </li>`,
        )
        .join('')}
    </ul>
    ${book.more_in_genre.length ? `<h2 class="section-title">More in ${book.genre}</h2>${shelf(book.more_in_genre)}` : ''}`

  document.getElementById('add-to-cart').addEventListener('click', () => {
    addToCart(book.id)
    openCart()
  })
}

// ---- Cart ----

const cart = {
  items: JSON.parse(localStorage.getItem('folio-cart') || '[]'),
  coupon: '',
}

function saveCart() {
  localStorage.setItem('folio-cart', JSON.stringify(cart.items))
  document.getElementById('cart-count').textContent = cart.items.reduce((count, item) => count + item.qty, 0)
}

function addToCart(id) {
  const existing = cart.items.find((item) => item.id === id)
  if (existing) existing.qty += 1
  else cart.items.push({ id, qty: 1 })
  saveCart()
}

function changeQuantity(id, change) {
  const item = cart.items.find((entry) => entry.id === id)
  if (!item) return
  item.qty += change
  cart.items = cart.items.filter((entry) => entry.qty > 0)
  saveCart()
  renderCart()
}

function priceCart() {
  return api('/api/cart/quote', { method: 'POST', body: { items: cart.items, coupon: cart.coupon } })
}

function totalsMarkup(priced) {
  return `
    <dl class="totals">
      <dt>Subtotal</dt><dd>${rupees(priced.subtotal)}</dd>
      ${priced.coupon ? `<dt>Coupon ${priced.coupon}</dt><dd>−${rupees(priced.discount)}</dd>` : ''}
      <dt>Shipping</dt><dd>${priced.shipping ? rupees(priced.shipping) : 'Free'}</dd>
      <dt class="grand">Total</dt><dd class="grand">${rupees(priced.total)}</dd>
    </dl>`
}

async function renderCart() {
  const body = document.getElementById('cart-body')
  if (!cart.items.length) {
    body.innerHTML = '<p class="empty">Your cart is empty.</p>'
    return
  }
  try {
    const priced = await priceCart()
    const toFreeShipping = priced.free_shipping_from - (priced.subtotal - priced.discount)
    body.innerHTML = `
      <ul class="lines">
        ${priced.lines
          .map(
            (line) => `
            <li>
              <span class="mini-cover" style="background:${line.cover}"></span>
              <div>
                <div class="line-title">${escapeHtml(line.title)}</div>
                <div class="qty">
                  <button type="button" data-id="${line.id}" data-change="-1" aria-label="One less">−</button>
                  ${line.qty}
                  <button type="button" data-id="${line.id}" data-change="1" aria-label="One more">+</button>
                </div>
              </div>
              <strong>${rupees(line.total)}</strong>
            </li>`,
          )
          .join('')}
      </ul>
      <div class="shipping-progress">
        ${toFreeShipping > 0 ? `Add ${rupees(toFreeShipping)} more for free shipping.` : 'You get free shipping.'}
        <div class="bar"><span style="width:${Math.min(100, ((priced.subtotal - priced.discount) / priced.free_shipping_from) * 100)}%"></span></div>
      </div>
      <form class="coupon" id="coupon-form">
        <input name="coupon" placeholder="Coupon code" autocomplete="off" value="${escapeHtml(cart.coupon)}" />
        <button class="button quiet" type="submit">Apply</button>
      </form>
      ${totalsMarkup(priced)}
      <a class="button wide" href="#/checkout" style="display:grid;place-items:center;text-decoration:none">Checkout</a>`

    document.getElementById('coupon-form').addEventListener('submit', (event) => {
      event.preventDefault()
      cart.coupon = new FormData(event.target).get('coupon').trim()
      renderCart()
    })
  } catch (error) {
    cart.coupon = ''
    showError(error)
  }
}

const drawer = document.getElementById('cart')
const scrim = document.getElementById('scrim')

function openCart() {
  drawer.classList.add('open')
  drawer.setAttribute('aria-hidden', 'false')
  scrim.hidden = false
  renderCart()
}

function closeCart() {
  drawer.classList.remove('open')
  drawer.setAttribute('aria-hidden', 'true')
  scrim.hidden = true
}

document.getElementById('open-cart').addEventListener('click', openCart)
document.getElementById('close-cart').addEventListener('click', closeCart)
scrim.addEventListener('click', closeCart)
document.getElementById('cart-body').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-change]')
  if (button) changeQuantity(button.dataset.id, Number(button.dataset.change))
})

// ---- Checkout ----

async function renderCheckout() {
  if (!cart.items.length) {
    view.innerHTML = '<div class="narrow"><h1>Checkout</h1><p class="muted">Your cart is empty. <a href="#/">Find a book</a>.</p></div>'
    return
  }
  const priced = await priceCart()
  view.innerHTML = `
    <a class="back" href="#/">← Keep shopping</a>
    <div class="checkout">
      <div>
        <h1>Checkout</h1>
        <form class="form" id="checkout-form">
          <label>Full name<input name="name" autocomplete="name" required /></label>
          <div class="two">
            <label>Email<input name="email" type="email" autocomplete="email" required /></label>
            <label>Pincode<input name="pincode" inputmode="numeric" maxlength="6" autocomplete="postal-code" required /></label>
          </div>
          <button class="button" type="submit">Place order · ${rupees(priced.total)}</button>
          <p class="muted">Folio is a demo store: no payment is taken.</p>
        </form>
      </div>
      <div class="panel">
        <h2>Order summary</h2>
        <ul class="lines">
          ${priced.lines
            .map(
              (line) => `
              <li>
                <span class="mini-cover" style="background:${line.cover}"></span>
                <div><div class="line-title">${escapeHtml(line.title)}</div><div class="qty">Qty ${line.qty}</div></div>
                <strong>${rupees(line.total)}</strong>
              </li>`,
            )
            .join('')}
        </ul>
        <br />
        ${totalsMarkup(priced)}
      </div>
    </div>`

  document.getElementById('checkout-form').addEventListener('submit', async (event) => {
    event.preventDefault()
    const customer = Object.fromEntries(new FormData(event.target))
    try {
      const { order } = await api('/api/orders', {
        method: 'POST',
        body: { items: cart.items, coupon: cart.coupon, customer },
      })
      cart.items = []
      cart.coupon = ''
      saveCart()
      location.hash = `#/order/${order.code}?placed=1`
    } catch (error) {
      showError(error)
    }
  })
}

// ---- Orders ----

function renderTrack() {
  view.innerHTML = `
    <div class="narrow">
      <h1>Track an order</h1>
      <p class="muted">Paste the order code you were given when you placed your order.</p>
      <form class="form" id="track-form">
        <label>Order code<input name="code" required autocomplete="off" /></label>
        <button class="button" type="submit">Find my order</button>
      </form>
    </div>`
  document.getElementById('track-form').addEventListener('submit', (event) => {
    event.preventDefault()
    location.hash = `#/order/${new FormData(event.target).get('code').trim()}`
  })
}

async function renderOrder(code, justPlaced) {
  const { order } = await api(`/api/orders/${encodeURIComponent(code)}`)
  const placed = new Date(order.placed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  view.innerHTML = `
    <div class="narrow">
      ${justPlaced ? '<span class="confirmed">Order placed</span>' : ''}
      <h1>Order ${order.order_id}</h1>
      <p class="muted">Placed ${placed} by ${escapeHtml(order.name)}, shipping to ${order.pincode}.</p>
      <div class="panel">
        <ul class="lines">
          ${order.lines.map((line) => `<li class="plain"><div>${escapeHtml(line.title)} <span class="muted">× ${line.qty}</span></div><strong>${rupees(line.total)}</strong></li>`).join('')}
        </ul>
        <br />
        <dl class="totals">
          ${order.discount ? `<dt>Discount</dt><dd>−${rupees(order.discount)}</dd>` : ''}
          <dt>Shipping</dt><dd>${order.shipping ? rupees(order.shipping) : 'Free'}</dd>
          <dt class="grand">Total</dt><dd class="grand">${rupees(order.total)}</dd>
        </dl>
        <p class="muted">Keep this order code to look the order up again:</p>
        <code class="code">${escapeHtml(code)}</code>
      </div>
    </div>`
}

// ---- Router ----

async function route() {
  const [path, query] = location.hash.replace(/^#/, '').split('?')
  const [, page, param] = (path || '/').split('/')
  document.querySelectorAll('.nav a').forEach((link) => {
    link.toggleAttribute('aria-current', link.getAttribute('href') === `#/${page || ''}`)
    if (link.hasAttribute('aria-current')) link.setAttribute('aria-current', 'page')
  })
  closeCart()
  window.scrollTo(0, 0)
  try {
    if (page === 'book') await renderBook(param)
    else if (page === 'checkout') await renderCheckout()
    else if (page === 'track') renderTrack()
    else if (page === 'order') await renderOrder(param, query === 'placed=1')
    else await renderShop()
  } catch (error) {
    view.innerHTML = `<div class="narrow"><h1>Sorry</h1><p class="muted">${escapeHtml(error.message)}</p><a class="button" href="#/" style="display:inline-grid;place-items:center;text-decoration:none">Back to the shop</a></div>`
  }
}

window.addEventListener('hashchange', route)
saveCart()
route()
