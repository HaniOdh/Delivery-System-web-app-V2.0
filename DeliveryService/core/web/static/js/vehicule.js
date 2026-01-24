document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddVehicleButton");
    const modal = document.getElementById("addVehicleModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addVehicleForm");
    const deleteBtn = document.querySelector('.btn.danger');    const printBtn = document.querySelector('.btn.light');
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
            plate_number: form.plate_number.value.trim(),
            brand: form.brand.value.trim(),
            model: form.model.value.trim(),
            max_weight: form.max_weight.value,
            max_volume: form.max_volume.value,
            status: form.status.value.trim()
        };

        // Send POST request to API
        fetch("/api/vehicles/", {
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
                const message = errorData.detail || "Failed to create vehicle";
                throw new Error(message);
            }
            return response.json();
        })
        .then(createdVehicle => {
            console.log("Vehicle created:", createdVehicle);

            // Optimistically add the new row to the table
            const tbody = document.querySelector("table tbody");
            if (tbody) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="id-col">
                        <input type="checkbox" name="selected_vehicles" value="${createdVehicle.id}">
                        ${createdVehicle.id}
                    </td>
                    <td>${createdVehicle.plate_number}</td>
                    <td>${createdVehicle.brand}</td>
                    <td>${createdVehicle.model}</td>
                    <td>${createdVehicle.max_weight} kg</td>
                    <td>${createdVehicle.max_volume} m³</td>
                    <td>${createdVehicle.status}</td>
                `;
                tbody.prepend(tr);
            }

            // Clear form & close modal
            form.reset();
            modal.style.display = "none";
        })
        .catch(error => {
            alert("Error creating vehicle: " + error.message);
            console.error("API error:", error);
        });
    });

    // -----------------------
    // Handle Delete Selected Vehicles
    // -----------------------
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
            
            if (checkboxes.length === 0) {
                alert("Veuillez sélectionner au moins un véhicule à supprimer.");
                return;
            }
            
            const vehicleIds = Array.from(checkboxes).map(cb => cb.value);
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${vehicleIds.length} véhicule(s)?\nCette action est irréversible.`);
            
            if (!confirmDelete) {
                return;
            }
            
            const deletePromises = vehicleIds.map(id => {
                return fetch(`/api/vehicles/${id}/`, {
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
                        alert(`${vehicleIds.length} véhicule(s) supprimé(s) avec succès!`);
                        location.reload();
                    } else {
                        throw new Error("Certains véhicules n'ont pas pu être supprimés.");
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
