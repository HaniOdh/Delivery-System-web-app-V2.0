document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddAgentButton");
    const modal = document.getElementById("addAgentModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addAgentForm");
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
            first_name: form.first_name.value.trim(),
            last_name: form.last_name.value.trim(),
            username: form.username.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(), // matches your HTML field name
        };

        // Send POST request to API
        fetch("http://127.0.0.1:8000/api/agents/", {  // use relative URL
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
                const message = errorData.detail || "Failed to create agent";
                throw new Error(message);
            }
            return response.json();
        })
        .then(createdAgent => {
            console.log("Agent created:", createdAgent);

            // Clear form & close modal
            form.reset();
            modal.style.display = "none";
            location.reload();
        })
        .catch(error => {
            alert("Error creating agent: " + error.message);
            console.error("API error:", error);
        });
    });

    // -----------------------
    // Handle Delete Selected Agents
    // -----------------------
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
            
            if (checkboxes.length === 0) {
                alert("Veuillez sélectionner au moins un agent à supprimer.");
                return;
            }
            
            const agentIds = Array.from(checkboxes).map(cb => cb.value);
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${agentIds.length} agent(s)?\nCette action est irréversible.`);
            
            if (!confirmDelete) {
                return;
            }
            
            const deletePromises = agentIds.map(id => {
                return fetch(`/api/agents/${id}/`, {
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
                        alert(`${agentIds.length} agent(s) supprimé(s) avec succès!`);
                        location.reload();
                    } else {
                        throw new Error("Certains agents n'ont pas pu être supprimés.");
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
