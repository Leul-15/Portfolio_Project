function issueLoan(event) {
  event.preventDefault();

  const bookId = document.getElementById("bookId").value;
  const loanDate = document.getElementById("loanDate").value;
  const loanedTo = document.getElementById("loanedTo").value;
  const returnDate = document.getElementById("returnDate").value;

  const payload = {
    LoanDate: loanDate,
    LoanedTo: loanedTo,
    ReturnDate: returnDate,
  };

  fetch(`http://127.0.0.1:5000/api/books/${bookId}/loans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to issue loan.");
      }
      return response.json();
    })
    .then((data) => {
      fetchLoans();
      document.getElementById("message").innerText =
        "Loan issued successfully!";
    })
    .catch((error) => console.error("Error issuing loan:", error));
}

function updateLoan(bookId, loanId) {
  const newLoanDate = prompt("Enter the new loan date (YYYY-MM-DD):");
  if (newLoanDate === null) return; // If the user cancels, exit

  const payload = {
    LoanDate: newLoanDate,
  };

  fetch(`http://127.0.0.1:5000/api/books/${bookId}/loans/${loanId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update loan.");
      }
      return response.json();
    })
    .then((data) => {
      fetchLoans();
      alert("Loan updated successfully!");
    })
    .catch((error) => console.error("Error updating loan:", error));
}

function deleteLoan(bookId, loanId) {
  if (!confirm("Are you sure you want to delete this loan?")) return;

  fetch(`http://127.0.0.1:5000/api/books/${bookId}/loans/${loanId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete loan.");
      }
      fetchLoans();
      alert("Loan deleted successfully!");
    })
    .catch((error) => console.error("Error deleting loan:", error));
}

window.addEventListener("load", () => {
  fetchBooks();
});

function fetchBooks() {
  fetch("http://127.0.0.1:5000/api/books")
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById("bookId");
      select.innerHTML = "";

      data.forEach((book) => {
        const option = document.createElement("option");
        option.value = book.ID;
        option.textContent = book.Title;
        select.appendChild(option);
      });

      fetchLoans();
    })
    .catch((error) => console.error("Error fetching books:", error));
}

function fetchLoans() {
  fetch("http://127.0.0.1:5000/api/books")
    .then((response) => response.json())
    .then((books) => {
      const tbody = document.querySelector("tbody");
      tbody.innerHTML = "";

      books.forEach((book) => {
        fetch(`http://127.0.0.1:5000/api/books/${book.ID}/loans`)
          .then((response) => response.json())
          .then((data) => {
            data.forEach((loan) => {
              const tr = document.createElement("tr");
              tr.innerHTML = `
                <td>${loan.LoanID}</td>
                <td>${loan.BookID}</td>
                <td>${loan.LoanDate}</td>
                <td>${loan.LoanedTo}</td>
                <td>${loan.ReturnDate || "Not returned"}</td>
                <td>
                  <button class="updateBtn" data-bookid="${
                    loan.BookID
                  }" data-loanid="${loan.LoanID}">Update</button>
                  <button class="deleteBtn" data-bookid="${
                    loan.BookID
                  }" data-loanid="${loan.LoanID}">Delete</button>
                </td>
              `;
              tbody.appendChild(tr);
            });
          })
          .catch((error) =>
            console.error("Error fetching loans for book:", book.ID, error)
          );
      });
    })
    .catch((error) => console.error("Error fetching books:", error));
}

document.getElementById("issueLoanForm").addEventListener("submit", issueLoan);

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("updateBtn")) {
    const bookId = event.target.dataset.bookid;
    const loanId = event.target.dataset.loanid;
    updateLoan(bookId, loanId);
  } else if (event.target.classList.contains("deleteBtn")) {
    const bookId = event.target.dataset.bookid;
    const loanId = event.target.dataset.loanid;
    deleteLoan(bookId, loanId);
  }
});
