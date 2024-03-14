function fetchBooks() {
  fetch("http://127.0.0.1:5000/api/books")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.querySelector("#bookTable tbody");
      tbody.innerHTML = "";

      data.forEach((book) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${book.ID}</td>
            <td>${book.Title}</td>
            <td>${book.Author}</td>
            <td>${book.Publisher}</td>
            <td>${book.PublishedDate}</td>
            <td>${book.ShelfNumber}</td>
            <td>${book.ColumnNumber}</td>
            <td>${book.RowNumber}</td>
            <td>
              <button class="updateBtn" data-id="${book.ID}">Update</button>
              <button class="deleteBtn" data-id="${book.ID}">Delete</button>
            </td>
          `;
        tbody.appendChild(tr);
      });

      document.querySelectorAll(".updateBtn").forEach((btn) => {
        btn.addEventListener("click", updateBook);
      });

      document.querySelectorAll(".deleteBtn").forEach((btn) => {
        btn.addEventListener("click", deleteBook);
      });
    })
    .catch((error) => console.error("Error fetching books:", error));
}

function updateBook(event) {
  const bookId = event.target.dataset.id;
  const updatedTitle = prompt("Enter the updated title:");
  const updatedAuthor = prompt("Enter the updated author:");
  const updatedPublisher = prompt("Enter the updated publisher:");
  const updatedPublishedDate = prompt(
    "Enter the updated published date (YYYY-MM-DD):"
  );
  const updatedShelfNumber = prompt("Enter the updated shelf number:");
  const updatedColumnNumber = prompt("Enter the updated column number:");
  const updatedRowNumber = prompt("Enter the updated row number:");

  const updatedBookData = {
    Title: updatedTitle,
    Author: updatedAuthor,
    Publisher: updatedPublisher,
    PublishedDate: updatedPublishedDate,
    ShelfNumber: updatedShelfNumber,
    ColumnNumber: updatedColumnNumber,
    RowNumber: updatedRowNumber,
  };

  fetch(`http://127.0.0.1:5000/api/books/${bookId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedBookData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update book.");
      }
      return response.json();
    })
    .then((data) => {
      fetchBooks();
      alert("Book updated successfully!");
    })
    .catch((error) => console.error("Error updating book:", error));
}

function deleteBook(event) {
  const bookId = event.target.dataset.id;
  fetch(`http://127.0.0.1:5000/api/books/${bookId}/loans`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch loans for the book.");
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        alert("This book is currently loaned and cannot be deleted.");
      } else {
        if (confirm("Are you sure you want to delete this book?")) {
          fetch(`http://127.0.0.1:5000/api/books/${bookId}`, {
            method: "DELETE",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to delete book.");
              }
              fetchBooks();
              alert("Book deleted successfully!");
            })
            .catch((error) => console.error("Error deleting book:", error));
        }
      }
    })
    .catch((error) => console.error("Error checking loan status:", error));
}

function addBook(event) {
  event.preventDefault();
  const form = document.getElementById("addBookForm");

  const bookData = {
    Title: form.title.value,
    Author: form.author.value,
    Publisher: form.publisher.value,
    PublishedDate: form.publishedDate.value,
    ShelfNumber: form.shelfNumber.value,
    ColumnNumber: form.columnNumber.value,
    RowNumber: form.rowNumber.value,
  };

  fetch("http://127.0.0.1:5000/api/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to add book.");
      }
      return response.json();
    })
    .then((data) => {
      fetchBooks();
      document.getElementById("message").innerText = "Book added successfully!";
    })
    .catch((error) => console.error("Error adding book:", error));
}

document.getElementById("addBookForm").addEventListener("submit", addBook);

window.addEventListener("load", fetchBooks);
