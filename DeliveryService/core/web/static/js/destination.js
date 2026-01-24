document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddDestinationButton");
    const modal = document.getElementById("addDestinationModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addDestinationForm");
    const deleteBtn = document.querySelector('.btn.danger');
    const printBtn = document.querySelector('.btn.light');

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
            country: form.country.value.trim(),
            city: form.city.value.trim(),
            zone: form.zone.value.trim(),
            base_rate: form.base_rate.value.trim()
        };

        // Send POST request to API
        fetch("/api/destinations/", {
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
                const message = errorData.detail || "Failed to create destination";
                throw new Error(message);
            }
            return response.json();
        })
        .then(createdDestination => {
            console.log("Destination created:", createdDestination);

            // Optimistically add the new row to the table
            const tbody = document.querySelector("table tbody");
            if (tbody) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="id-col">
                        <input type="checkbox" name="selected_destinations" value="${createdDestination.id}">
                        ${createdDestination.id}
                    </td>
                    <td>${createdDestination.country}</td>
                    <td>${createdDestination.city}</td>
                    <td>${createdDestination.zone}</td>
                    <td>${createdDestination.base_rate}</td>
                `;
                tbody.prepend(tr);
            }

            // Clear form & close modal
            form.reset();
            modal.style.display = "none";
        })
        .catch(error => {
            alert("Error creating destination: " + error.message);
            console.error("API error:", error);
        });
    });

    // -----------------------
    // Handle Delete Selected Destinations
    // -----------------------
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            const checkboxes = document.querySelectorAll('input[name="selected_destinations"]:checked');
            
            if (checkboxes.length === 0) {
                alert("Veuillez sélectionner au moins une destination à supprimer.");
                return;
            }
            
            const destinationIds = Array.from(checkboxes).map(cb => cb.value);
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${destinationIds.length} destination(s)?\nCette action est irréversible.`);
            
            if (!confirmDelete) {
                return;
            }
            
            const deletePromises = destinationIds.map(id => {
                return fetch(`/api/destinations/${id}/`, {
                    method: "DELETE",
                    headers: {
                        "X-CSRFToken": getCSRFToken()
                    },
                    credentials: "same-origin"
                });
            });
            
            Promise.all(deletePromises)
                .then(responses => {
                    const allSuccessful = responses.every(r => r.ok);
                    
                    if (allSuccessful) {
                        alert(`${destinationIds.length} destination(s) supprimée(s) avec succès!`);
                        location.reload();
                    } else {
                        throw new Error("Certaines destinations n'ont pas pu être supprimées.");
                    }
                })
                .catch(error => {
                    alert("Erreur lors de la suppression: " + error.message);
                    console.error("Delete error:", error);
                });
        });
    }

    // -----------------------
    // Handle Print Functionality
    // -----------------------
    if (printBtn) {
        printBtn.addEventListener("click", function(event) {
            event.preventDefault();
            window.print();
        });
    }

    // -----------------------
    // Select All / Deselect All Functionality
    // -----------------------
    const selectAllCheckbox = document.getElementById("selectAll");
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function() {
            const checkboxes = document.querySelectorAll('input[name="selected_destinations"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
    
    const rowCheckboxes = document.querySelectorAll('input[name="selected_destinations"]');
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
            const anyChecked = Array.from(rowCheckboxes).some(cb => cb.checked);
            
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = anyChecked && !allChecked;
            }
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
