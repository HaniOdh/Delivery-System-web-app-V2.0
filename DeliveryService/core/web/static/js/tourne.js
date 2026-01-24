document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddTourneeButton");
    const modal = document.getElementById("AddTourneeModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addTourneeForm");

    // Debug: Check if elements are found
    console.log("Open button:", openBtn);
    console.log("Modal:", modal);
    console.log("Close button:", closeBtn);
    console.log("Form:", form);

    if (!openBtn || !modal || !closeBtn || !form) {
        console.error("One or more required elements are missing from the DOM");
        return;
    }

    // -----------------------
    // Open & Close Modal
    // -----------------------
    openBtn.addEventListener("click", function(event) {
        event.preventDefault();
        console.log("Button clicked, opening modal");
        modal.style.display = "block";
    });

    closeBtn.addEventListener("click", function() {
        console.log("Close button clicked");
        modal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            console.log("Outside modal clicked");
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
            tour_date: form.tour_date.value.trim(),
            driver: form.driver.value.trim(),
            vehicle: form.vehicle.value.trim(),
            nb_exp: form.nb_exp.value,
            distance: form.distance.value,
            duration: form.duration.value,
            carb: form.carb.value,
            incd: form.incd.value,
            status: form.status.value.trim()
        };

        // Send POST request to API
        fetch("/api/tours/", {
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
                const message = errorData.detail || "Failed to create tournee";
                throw new Error(message);
            }
            return response.json();
        })
        .then(createdTournee => {
            console.log("Tournee created:", createdTournee);

            // Optimistically add the new row to the table
            const tbody = document.querySelector("table tbody");
            if (tbody) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="id-col">
                        <input type="checkbox" name="selected_tournees" value="${createdTournee.id}">
                        ${createdTournee.id}
                    </td>
                    <td>${createdTournee.tour_date}</td>
                    <td>${createdTournee.driver}</td>
                    <td>${createdTournee.vehicle}</td>
                    <td>${createdTournee.nb_exp}</td>
                    <td>${createdTournee.distance}</td>
                    <td>${createdTournee.duration}</td>
                    <td>${createdTournee.carb}</td>
                    <td>${createdTournee.incd}</td>
                    <td class="status">
                        ${createdTournee.status}
                    </td>
                `;
                tbody.prepend(tr);
            }

            // Clear form & close modal
            form.reset();
            modal.style.display = "none";
        })
        .catch(error => {
            alert("Error creating tournee: " + error.message);
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
