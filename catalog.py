"""The book catalogue: what Folio sells, and how books are found, filtered and rated."""

GENRES = ["Fiction", "Science fiction", "Philosophy", "Poetry"]

BOOKS = [
    {
        "id": "pride-and-prejudice",
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "genre": "Fiction",
        "year": 1813,
        "pages": 432,
        "price": 349,
        "cover": "#7a2e2e",
        "description": "Elizabeth Bennet and Mr Darcy misjudge each other, then slowly, stubbornly, stop.",
        "reviews": [
            {"name": "Ananya R.", "stars": 5, "text": "Sharper and funnier than I remembered from school."},
            {"name": "Kabir S.", "stars": 4, "text": "Slow first fifty pages, then I could not put it down."},
            {"name": "Meera J.", "stars": 5, "text": "Lovely paper and a clean, readable typeface."},
        ],
    },
    {
        "id": "frankenstein",
        "title": "Frankenstein",
        "author": "Mary Shelley",
        "genre": "Fiction",
        "year": 1818,
        "pages": 288,
        "price": 299,
        "cover": "#2f3b2f",
        "description": "A young scientist builds a living being and runs from what he has made.",
        "reviews": [
            {"name": "Rohan P.", "stars": 5, "text": "Nothing like the films. Sad more than scary."},
            {"name": "Isha K.", "stars": 4, "text": "The creature's chapters are the best part."},
        ],
    },
    {
        "id": "little-women",
        "title": "Little Women",
        "author": "Louisa May Alcott",
        "genre": "Fiction",
        "year": 1868,
        "pages": 512,
        "price": 399,
        "cover": "#8a5a44",
        "description": "Four sisters grow up, fall out, make up and find their own ways in the world.",
        "reviews": [
            {"name": "Sana M.", "stars": 5, "text": "Bought it for my niece and read it first myself."},
            {"name": "Dev A.", "stars": 4, "text": "Warm without being sugary."},
        ],
    },
    {
        "id": "the-picture-of-dorian-gray",
        "title": "The Picture of Dorian Gray",
        "author": "Oscar Wilde",
        "genre": "Fiction",
        "year": 1890,
        "pages": 272,
        "price": 279,
        "cover": "#3b3b4f",
        "description": "A beautiful young man stays young while his portrait ages in a locked room.",
        "reviews": [
            {"name": "Arjun T.", "stars": 5, "text": "Every other line is quotable."},
            {"name": "Nisha G.", "stars": 3, "text": "Brilliant dialogue, thin plot."},
        ],
    },
    {
        "id": "the-time-machine",
        "title": "The Time Machine",
        "author": "H. G. Wells",
        "genre": "Science fiction",
        "year": 1895,
        "pages": 128,
        "price": 249,
        "cover": "#1f3a5f",
        "description": "A Victorian inventor travels to the year 802,701 and does not like what he finds.",
        "reviews": [
            {"name": "Vikram N.", "stars": 4, "text": "Short, strange and still unsettling."},
            {"name": "Priya D.", "stars": 4, "text": "Read it in one sitting on a train."},
        ],
    },
    {
        "id": "the-war-of-the-worlds",
        "title": "The War of the Worlds",
        "author": "H. G. Wells",
        "genre": "Science fiction",
        "year": 1898,
        "pages": 224,
        "price": 269,
        "cover": "#5a2a1f",
        "description": "Martians land in Surrey, and the most powerful empire on Earth is helpless.",
        "reviews": [
            {"name": "Farhan Q.", "stars": 5, "text": "The original alien invasion, and still the best."},
            {"name": "Tara B.", "stars": 4, "text": "The ending is perfect."},
        ],
    },
    {
        "id": "journey-to-the-centre-of-the-earth",
        "title": "Journey to the Centre of the Earth",
        "author": "Jules Verne",
        "genre": "Science fiction",
        "year": 1864,
        "pages": 256,
        "price": 299,
        "cover": "#2d4a4a",
        "description": "A professor, his nephew and a guide climb down an Icelandic volcano.",
        "reviews": [
            {"name": "Neel C.", "stars": 4, "text": "Pure adventure. My son loved it too."},
        ],
    },
    {
        "id": "meditations",
        "title": "Meditations",
        "author": "Marcus Aurelius",
        "genre": "Philosophy",
        "year": 180,
        "pages": 256,
        "price": 399,
        "cover": "#5c4a2a",
        "description": "Private notes on duty, loss and keeping calm, written by a Roman emperor on campaign.",
        "reviews": [
            {"name": "Aditya V.", "stars": 5, "text": "I keep it on my desk and read a page a day."},
            {"name": "Ritika L.", "stars": 5, "text": "Good modern translation, easy to follow."},
            {"name": "Sameer H.", "stars": 4, "text": "Repetitive in places, which is sort of the point."},
        ],
    },
    {
        "id": "the-art-of-war",
        "title": "The Art of War",
        "author": "Sun Tzu",
        "genre": "Philosophy",
        "year": -500,
        "pages": 112,
        "price": 199,
        "cover": "#8a3b12",
        "description": "Thirteen short chapters on strategy that are still quoted in boardrooms.",
        "reviews": [
            {"name": "Karan M.", "stars": 4, "text": "Short enough to reread every year."},
            {"name": "Aisha F.", "stars": 3, "text": "Useful, but the notes are longer than the text."},
        ],
    },
    {
        "id": "walden",
        "title": "Walden",
        "author": "Henry David Thoreau",
        "genre": "Philosophy",
        "year": 1854,
        "pages": 352,
        "price": 329,
        "cover": "#3f5a36",
        "description": "Two years in a cabin by a pond, and what living simply taught one stubborn man.",
        "reviews": [
            {"name": "Ira S.", "stars": 4, "text": "Best read slowly, outdoors if you can."},
        ],
    },
    {
        "id": "gitanjali-illustrated",
        "title": "Gitanjali",
        "author": "Rabindranath Tagore",
        "genre": "Poetry",
        "year": 1910,
        "pages": 160,
        "price": 549,
        "cover": "#3d2f5c",
        "description": "Tagore's song offerings, in a new illustrated edition. Just arrived.",
        "reviews": [],
        "new": True,
    },
    {
        "id": "the-prophet",
        "title": "The Prophet",
        "author": "Kahlil Gibran",
        "genre": "Poetry",
        "year": 1923,
        "pages": 112,
        "price": 249,
        "cover": "#6b4e2e",
        "description": "A departing traveller answers questions on love, work, children and death.",
        "reviews": [
            {"name": "Zoya N.", "stars": 5, "text": "The chapter on marriage was read at our wedding."},
            {"name": "Rahul E.", "stars": 4, "text": "Beautiful little hardback."},
        ],
    },
]

BOOK_BY_ID = {book["id"]: book for book in BOOKS}

SORTS = {
    "featured": lambda book: BOOKS.index(book),
    "price-low": lambda book: book["price"],
    "price-high": lambda book: -book["price"],
    "newest": lambda book: -book["year"],
}


def find_book(book_id):
    return BOOK_BY_ID.get(book_id)


def summary(book):
    """The fields shown on a shelf card."""
    return {
        "id": book["id"],
        "title": book["title"],
        "author": book["author"],
        "genre": book["genre"],
        "price": book["price"],
        "cover": book["cover"],
        "new": book.get("new", False),
    }


def average_rating(book):
    stars = [review["stars"] for review in book["reviews"]]
    return round(sum(stars) / len(stars), 1) if stars else 0.0


def details(book):
    """Everything shown on a book's page: its rating, reviews and more from the same genre."""
    more = [summary(other) for other in BOOKS if other["genre"] == book["genre"] and other["id"] != book["id"]]
    return {
        **summary(book),
        "year": book["year"],
        "pages": book["pages"],
        "description": book["description"],
        "rating": average_rating(book),
        "reviews": book["reviews"],
        "more_in_genre": more[:3],
    }


def browse(query="", genre=None, max_price=None, sort="featured"):
    """Books matching a title/author search, a genre and a price ceiling, in the chosen order."""
    query = query.strip().lower()
    results = [book for book in BOOKS if query in book["title"].lower() or query in book["author"].lower()]
    if genre:
        results = [book for book in results if book["genre"] == genre]
    if max_price is not None:
        results = [book for book in results if book["price"] <= max_price]
    return sorted(results, key=SORTS.get(sort, SORTS["featured"]))
