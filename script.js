const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const bookList = document.getElementById("bookList");
const message = document.getElementById("message");
const allButton = document.getElementById("allButton");
const favoritesButton = document.getElementById("favoritesButton");

let books = [];
let favorites = JSON.parse(localStorage.getItem("favoriteBooks")) || [];
let showFavorites = false;

searchForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (query === "") {
    message.textContent = "Please enter a book title or author.";
    return;
  }
  showFavorites = false;
  searchBooks(query);
});

async function searchBooks(query) {
  message.textContent = "Loading books...";
  bookList.innerHTML = "";
  try {
    const response = await fetch("https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(query) + "&maxResults=20");
    const data = await response.json();
    books = data.items || [];
    if (books.length === 0) {
      message.textContent = "No books found. Please try another search.";
      return;
    }
    displayBooks(books);
    message.textContent = "Found " + books.length + " books.";
  } catch (error) {
    message.textContent = "Something went wrong. Please try again.";
    console.log(error);
  }
}

function displayBooks(list) {
  bookList.innerHTML = "";
  if (list.length === 0) {
    message.textContent = "There are no books to show here.";
    return;
  }
  list.forEach(function(book) {
    const info = book.volumeInfo;
    const title = info.title || "Title not available";
    const authors = info.authors ? info.authors.join(", ") : "Author not available";
    const publisher = info.publisher || "Publisher not available";
    const year = info.publishedDate ? info.publishedDate.substring(0, 4) : "Year not available";
    const coverUrl = info.imageLinks ? info.imageLinks.thumbnail : "";
    const saved = favorites.some(function(item) { return item.id === book.id; });

    const card = document.createElement("article");
    card.className = "book-card";
    const image = document.createElement("img");
    image.className = "book-cover";
    image.src = coverUrl || "https://placehold.co/220x300?text=No+Cover";
    image.alt = "Cover of " + title;
    const heading = document.createElement("h3");
    heading.textContent = title;
    const authorLine = document.createElement("p");
    authorLine.textContent = "Author: " + authors;
    const publisherLine = document.createElement("p");
    publisherLine.textContent = "Publisher: " + publisher;
    const yearLine = document.createElement("p");
    yearLine.textContent = "Year: " + year;
    const favoriteBtn = document.createElement("button");
    favoriteBtn.textContent = saved ? "Remove favorite" : "Add favorite";
    favoriteBtn.addEventListener("click", function() { toggleFavorite(book); });
    const detailsBtn = document.createElement("button");
    detailsBtn.textContent = "Show details";
    detailsBtn.addEventListener("click", function() {
      alert(title + "\n\n" + (info.description || "Description not available."));
    });
    card.appendChild(image);
    card.appendChild(heading);
    card.appendChild(authorLine);
    card.appendChild(publisherLine);
    card.appendChild(yearLine);
    card.appendChild(favoriteBtn);
    card.appendChild(detailsBtn);
    bookList.appendChild(card);
  });
}

function toggleFavorite(book) {
  const saved = favorites.some(function(item) { return item.id === book.id; });
  if (saved) {
    favorites = favorites.filter(function(item) { return item.id !== book.id; });
  } else {
    favorites.push(book);
  }
  localStorage.setItem("favoriteBooks", JSON.stringify(favorites));
  displayBooks(showFavorites ? favorites : books);
}

allButton.addEventListener("click", function() {
  showFavorites = false;
  displayBooks(books);
});
favoritesButton.addEventListener("click", function() {
  showFavorites = true;
  displayBooks(favorites);
});