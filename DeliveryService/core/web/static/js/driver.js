document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddDriverButton");
    const modal = document.getElementById("addDriverModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addDriverForm");
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
            phone: form.phone.value.trim(),
            license_number: form.license_number.value.trim(),
            hire_date: form.hire_date.value,
            status: form.status.value.trim()
        };

        // Send POST request to API
        fetch("/api/drivers/", {
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
                const message = errorData.detail || "Failed to create driver";
                throw new Error(message);
            }
            return response.json();
        })
        .then(createdDriver => {
            console.log("Driver created:", createdDriver);

            // Optimistically add the new row to the table
            const tbody = document.querySelector("table tbody");
            if (tbody) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="id-col">
                        <input type="checkbox" name="selected_drivers" value="${createdDriver.id}">
                        ${createdDriver.id}
                    </td>
                    <td>${createdDriver.first_name}</td>
                    <td>${createdDriver.last_name}</td>
                    <td>${createdDriver.phone}</td>
                    <td>${createdDriver.license_number}</td>
                `;
                tbody.prepend(tr);
            }

            // Clear form & close modal
            form.reset();
            modal.style.display = "none";
        })
        .catch(error => {
            alert("Error creating driver: " + error.message);
            console.error("API error:", error);
        });
    });

    // -----------------------
    // Handle Delete Selected Drivers
    // -----------------------
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function (event) {
                event.preventDefault();

                // Récupérer tous les checkboxes cochés
                const selectedCheckboxes = document.querySelectorAll('input[name="selected_drivers"]:checked');
                
                if (selectedCheckboxes.length === 0) {
                    alert("Veuillez sélectionner au moins un driver à supprimer.");
                    return;
                }

                // Confirmation de suppression
                const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${selectedCheckboxes.length} driver(s) ?`);
                
                if (!confirmDelete) {
                    return;
                }

                // Collecter les IDs des drivers sélectionnés
                const driverIds = Array.from(selectedCheckboxes).map(cb => cb.value);
                console.log("IDs à supprimer:", driverIds);

                // Supprimer chaque driver
                let deletedCount = 0;
                let failedCount = 0;

                Promise.all(
                    driverIds.map(driverId => 
                        fetch(`/api/drivers/${driverId}/`, {
                            method: "DELETE",
                            headers: {
                                "X-CSRFToken": getCSRFToken()
                            }
                        })
                        .then(response => {
                            if (response.ok || response.status === 204) {
                                deletedCount++;
                                // Supprimer la ligne du tableau
                                const row = document.querySelector(`input[value="${driverId}"]`).closest('tr');
                                if (row) {
                                    row.remove();
                                }
                                return { success: true, id: driverId };
                            } else {
                                failedCount++;
                                return { success: false, id: driverId };
                            }
                        })
                        .catch(error => {
                            failedCount++;
                            console.error(`Erreur lors de la suppression du driver ${driverId}:`, error);
                            return { success: false, id: driverId };
                        })
                    )
                )
                .then(results => {
                    if (failedCount > 0) {
                        alert(`${deletedCount} driver(s) supprimé(s) avec succès.\n${failedCount} échec(s).`);
                    } else {
                        alert(`${deletedCount} driver(s) supprimé(s) avec succès!`);
                    }
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
            const checkboxes = document.querySelectorAll('input[name="selected_drivers"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
    
    // Update "Select All" checkbox state when individual checkboxes change
    const rowCheckboxes = document.querySelectorAll('input[name="selected_drivers"]');
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
