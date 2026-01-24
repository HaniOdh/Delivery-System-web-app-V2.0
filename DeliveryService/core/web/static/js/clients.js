document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddClientButton");
    const modal = document.getElementById("addClientModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addClientForm");

    // -----------------------
    // Open & Close Modal
    // -----------------------
    openBtn.addEventListener("click", () => {
        modal.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // -----------------------
    // Handle form submission
    // -----------------------
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // stop normal form submit

        // Collect form data as JSON
        const data = {
            first_name: form.first_name.value.trim(),
            last_name: form.last_name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            address: form.adress.value.trim()  // matches your HTML field name
        };

        // Send POST request to API
        fetch("http://127.0.0.1:8000/api/clients/", {  // use relative URL
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()  // required by Django
            },
            body: JSON.stringify(data)
        })
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.detail || "Failed to create client";
                throw new Error(message);
            }
            return response.json();
        })
        .then(createdClient => {
            console.log("Client created:", createdClient);

            // Clear form & close modal
            form.reset();
            modal.style.display = "none";
            location.reload();
        })
        .catch(error => {
            alert("Error creating client: " + error.message);
            console.error("API error:", error);
        });
    });

});

// -----------------------
// CSRF helper function
// -----------------------
function getCSRFToken() {
    let cookieValue = null;
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith("csrftoken=")) {
            cookieValue = cookie.substring("csrftoken=".length);
            break;
        }
    }
    return cookieValue;
}
