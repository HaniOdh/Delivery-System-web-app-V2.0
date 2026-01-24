document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddServiceTypeButton");
    const modal = document.getElementById("addServiceTypeModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addServiceTypeForm");
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
            label: form.label.value.trim(),
            price_per_weight: form.price_per_weight.value.trim(),
            price_per_volume: form.price_per_volume.value.trim(),
            estimated_delay: form.estimated_delay.value.trim()
        };

        // Send POST request to API
        fetch("/api/services/", {
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
                const message = errorData.detail || "Failed to create service type";
                throw new Error(message);
            }
            return response.json();
        })
        .then(createdServiceType => {
            console.log("Service Type created:", createdServiceType);

            // Optimistically add the new row to the table
            const tbody = document.querySelector("table tbody");
            if (tbody) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="id-col">
                        <input type="checkbox" name="selected_service_types" value="${createdServiceType.id}">
                        ${createdServiceType.id}
                    </td>
                    <td>${createdServiceType.label}</td>
                    <td>${createdServiceType.price_per_weight}</td>
                    <td>${createdServiceType.price_per_volume}</td>
                    <td>${createdServiceType.estimated_delay}</td>
                `;
                tbody.prepend(tr);
            }

            // Clear form & close modal
            form.reset();
            modal.style.display = "none";
        })
        .catch(error => {
            alert("Error creating service type: " + error.message);
            console.error("API error:", error);
        });
    });
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function (event) {
                event.preventDefault();

                // Récupérer tous les checkboxes cochés
                const selectedCheckboxes = document.querySelectorAll('input[name="selected_service_types"]:checked');
                
                if (selectedCheckboxes.length === 0) {
                    alert("Veuillez sélectionner au moins un service type à supprimer.");
                    return;
                }

                // Confirmation de suppression
                const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${selectedCheckboxes.length} service type(s) ?`);
                
                if (!confirmDelete) {
                    return;
                }

                // Collecter les IDs des service types sélectionnés
                const serviceTypeIds = Array.from(selectedCheckboxes).map(cb => cb.value);
                console.log("IDs à supprimer:", serviceTypeIds);

                // Supprimer chaque service type sélectionné
                let deletedCount = 0;
                let failedCount = 0;

                Promise.all(
                    serviceTypeIds.map(serviceTypeId => 
                        fetch(`/api/services/${serviceTypeId}/`, {
                            method: "DELETE",
                            headers: {
                                "X-CSRFToken": getCSRFToken()
                            }
                        })
                        .then(response => {
                            if (response.ok || response.status === 204) {
                                deletedCount++;
                                // Supprimer la ligne du tableau
                                const row = document.querySelector(`input[value="${serviceTypeId}"]`).closest('tr');
                                if (row) {
                                    row.remove();
                                }
                                return { success: true, id: serviceTypeId };
                            } else {
                                failedCount++;
                                return { success: false, id: serviceTypeId };
                            }
                        })
                        .catch(error => {
                            failedCount++;
                            console.error(`Erreur lors de la suppression du service type ${serviceTypeId}:`, error);
                            return { success: false, id: serviceTypeId };
                        })
                    )
                )
                .then(results => {
                    if (failedCount > 0) {
                        alert(`${deletedCount} service type(s) supprimé(s) avec succès.\n${failedCount} échec(s).`);
                    } else {
                        alert(`${deletedCount} service type(s) supprimé(s) avec succès!`);
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
            const checkboxes = document.querySelectorAll('input[name="selected_service_types"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
    
    // Update "Select All" checkbox state when individual checkboxes change
    const rowCheckboxes = document.querySelectorAll('input[name="selected_service_types"]');
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
