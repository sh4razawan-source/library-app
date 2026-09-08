// ==========================================
// 1. DATA STORAGE
// ==========================================

// /xray [STATE]: Holds all active Book instances in memory as an array
const myLibrary = [];

// ==========================================
// 2. DATA MODELS (CONSTRUCTOR & PROTOTYPES)
// ==========================================

// /xray [CONSTRUCTOR]: Blueprint function used to instantiate new Book objects
function Book(title, author, pages, isRead) {
  // /xray [ID]: Generates a unique, collision-proof UUID string for each book instance
  this.id = crypto.randomUUID();
  // /xray [PROP]: Assigns the book title string
  this.title = title;
  // /xray [PROP]: Assigns the book author string
  this.author = author;
  // /xray [PROP]: Assigns the total page count integer
  this.pages = pages;
  // /xray [PROP]: Assigns the read status boolean (true/false)
  this.isRead = isRead;
}

// /xray [PROTOTYPE METHOD]: Attaches toggle logic to Book.prototype so all instances share one function memory space
Book.prototype.toggleRead = function () {
  // /xray [MUTATION]: Flips the read status boolean value to its opposite
  this.isRead = !this.isRead;
};


// ==========================================
// 3. APPLICATION STATE LOGIC
// ==========================================

// /xray [ACTION]: Creates a new book instance, stores it, and triggers a UI update
function addBookToLibrary(title, author, pages, isRead) {
  // /xray [INSTANTIATION]: Calls Book constructor to create a new book object
  const newBook = new Book(title, author, pages, isRead);
  // /xray [STATE UPDATE]: Appends the new book object to the global myLibrary array
  myLibrary.push(newBook);
  // /xray [UI RENDER]: Refreshes the DOM elements to display the updated array
  displayBooks();
}


// ==========================================
// 4. UI RENDER ENGINE
// ==========================================

// /xray [RENDER]: Clears and re-builds the UI cards based on the current state of myLibrary
function displayBooks() {
  // /xray [DOM TARGET]: Selects the main grid container element from the HTML
  const container = document.querySelector("#library-container");
  // /xray [CLEANUP]: Wipes all existing HTML inside the container to avoid duplicate card rendering
  container.innerHTML = "";

  // /xray [LOOP]: Iterates over every book object currently stored in the myLibrary array
  myLibrary.forEach((book) => {
    // /xray [DOM CREATE]: Creates a blank <div> element to serve as the book card
    const card = document.createElement("div");
    // /xray [STYLING]: Applies the CSS 'card' class for styling
    card.classList.add("card");
    // /xray [DATA ATTR]: Binds the object's unique ID to the card's data attribute (data-id) for DOM-to-data mapping
    card.dataset.id = book.id;

    // /xray [TEMPLATE]: Injects card structure using escaped safe text and conditional button state
    card.innerHTML = `
      <h3>${escapeHTML(book.title)}</h3>
      <p class="author">by ${escapeHTML(book.author)}</p>
      <p>${book.pages} pages</p>
      <div class="card-actions">
        <button class="btn-toggle ${book.isRead ? "read" : ""}" data-action="toggle">
          ${book.isRead ? "Read" : "Not Read"}
        </button>
        <button class="btn-remove" data-action="remove">Remove</button>
      </div>
    `;

    // /xray [DOM APPEND]: Inserts the fully constructed card element into the library container
    container.appendChild(card);
  });
}

// /xray [SECURITY]: Helper function to sanitize user inputs and prevent XSS (Cross-Site Scripting) injection
function escapeHTML(str) {
  // /xray [REGEX]: Replaces raw HTML control characters with safe encoded HTML entities
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
  );
}


// ==========================================
// 5. EVENT DELEGATION (CARD ACTIONS)
// ==========================================

// /xray [DOM TARGET]: Grabs the library grid container for event listening
const container = document.querySelector("#library-container");

// /xray [EVENT LISTENER]: Uses event delegation to listen for clicks on all current and future cards
container.addEventListener("click", (e) => {
  // /xray [DOM TRAVERSAL]: Finds the closest ancestor element with the class '.card'
  const card = e.target.closest(".card");
  // /xray [GUARD]: Ignores clicks that happen outside of a book card element
  if (!card) return;

  // /xray [ID EXTRACTION]: Reads the unique ID stored on the card's HTML dataset attribute
  const bookId = card.dataset.id;
  // /xray [DATA LOOKUP]: Locates the matching book's index within the myLibrary state array
  const bookIndex = myLibrary.findIndex((book) => book.id === bookId);

  // /xray [GUARD]: Safety check to exit if the book ID isn't found in memory
  if (bookIndex === -1) return;

  // /xray [ACTION EXTRACTION]: Reads the data-action attribute of the clicked button ('toggle' or 'remove')
  const action = e.target.dataset.action;

  // /xray [BRANCH]: Toggles read status if the toggle button was clicked
  if (action === "toggle") {
    // /xray [METHOD CALL]: Executes prototype method to flip the book's boolean state
    myLibrary[bookIndex].toggleRead();
    // /xray [UI REFRESH]: Re-renders the display to update button colors and text
    displayBooks();
  // /xray [BRANCH]: Deletes the book if the remove button was clicked
  } else if (action === "remove") {
    // /xray [MUTATION]: Removes 1 item at the target index from the myLibrary array
    myLibrary.splice(bookIndex, 1);
    // /xray [UI REFRESH]: Re-renders the display to remove the card from the screen
    displayBooks();
  }
});


// ==========================================
// 6. DIALOG & FORM DOM HANDLERS
// ==========================================

// /xray [DOM ELEMENT]: Selects the HTML <dialog> modal element
const dialog = document.querySelector("#book-dialog");
// /xray [DOM ELEMENT]: Selects the "+ Add New Book" open button
const newBookBtn = document.querySelector("#new-book-btn");
// /xray [DOM ELEMENT]: Selects the modal cancel button
const closeDialogBtn = document.querySelector("#close-dialog-btn");
// /xray [DOM ELEMENT]: Selects the <form> element inside the dialog
const bookForm = document.querySelector("#book-form");

// /xray [EVENT LISTENER]: Opens the modal dialog as a backdrop modal when "+ Add New Book" is clicked
newBookBtn.addEventListener("click", () => dialog.showModal());

// /xray [EVENT LISTENER]: Closes the modal dialog when "Cancel" is clicked
closeDialogBtn.addEventListener("click", () => dialog.close());

// /xray [EVENT LISTENER]: Handles form submission logic
bookForm.addEventListener("submit", (e) => {
  // /xray [PREVENT DEFAULT]: Prevents browser form submission reload and GET request behavior
  e.preventDefault();

  // /xray [INPUT READ]: Extracts the string value from the Title input field
  const title = document.querySelector("#title").value;
  // /xray [INPUT READ]: Extracts the string value from the Author input field
  const author = document.querySelector("#author").value;
  // /xray [INPUT READ]: Parses the Pages input string into a base-10 integer
  const pages = parseInt(document.querySelector("#pages").value, 10);
  // /xray [INPUT READ]: Reads the checked boolean status of the Is Read checkbox
  const isRead = document.querySelector("#isRead").checked;

  // /xray [ACTION]: Creates the new book and refreshes the library state/UI
  addBookToLibrary(title, author, pages, isRead);

  // /xray [CLEANUP]: Resets all form fields to blank/default
  bookForm.reset();
  // /xray [DIALOG CLOSE]: Hides the modal dialog element
  dialog.close();
});


// ==========================================
// 7. INITIAL SEED DATA
// ==========================================

// /xray [SEED]: Adds initial book 1 to populate UI on page load
addBookToLibrary("The Hobbit", "J.R.R. Tolkien", 295, true);
// /xray [SEED]: Adds initial book 2 to populate UI on page load
addBookToLibrary("1984", "George Orwell", 328, false);
