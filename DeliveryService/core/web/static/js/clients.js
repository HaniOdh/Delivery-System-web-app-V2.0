document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddClientButton");
    const modal = document.getElementById("addClientModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addClientForm");
    const deleteBtn = document.getElementById('deleteClientBtn');
    const printBtn = document.getElementById('printClientBtn');

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
    // Handle Delete Selected Clients
    // -----------------------
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            // Get all checked checkboxes
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
            
            if (checkboxes.length === 0) {
                alert("Veuillez sélectionner au moins un client à supprimer.");
                return;
            }
            
            // Collect selected client IDs
            const clientIds = Array.from(checkboxes).map(cb => cb.value);
            
            // Confirm deletion
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${clientIds.length} client(s)?\nCette action est irréversible.`);
            
            if (!confirmDelete) {
                return;
            }
            
            // Delete each selected client
            const deletePromises = clientIds.map(id => {
                return fetch(`/api/clients/${id}/`, {
                    method: "DELETE",
                    headers: {
                        "X-CSRFToken": getCSRFToken()
                    },
                    credentials: "same-origin"
                });
            });
            
            // Wait for all deletions to complete
            Promise.all(deletePromises)
                .then(responses => {
                    const allSuccessful = responses.every(r => r.ok);
                    
                    if (allSuccessful) {
                        alert(`${clientIds.length} client(s) supprimé(s) avec succès!`);
                        location.reload();
                    } else {
                        throw new Error("Certains clients n'ont pas pu être supprimés.");
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
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
    
    // Update "Select All" checkbox state when individual checkboxes change
    const rowCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]');
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
