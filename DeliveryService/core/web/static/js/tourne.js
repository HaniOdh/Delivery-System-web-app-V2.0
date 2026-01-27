// Global function to update shipment count (needed for inline onchange handlers)
function updateShipmentCount() {
    const checkboxes = document.querySelectorAll('.shipment-checkbox-modal:checked');
    const countSpan = document.getElementById("selectedShipmentsCount");
    if (countSpan) {
        countSpan.textContent = `${checkboxes.length} expédition(s) sélectionnée(s)`;
    }
}

document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddTourneeButton");
    const modal = document.getElementById("AddTourneeModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addTourneeForm");
    const deleteBtn = document.getElementById('deleteTourneeBtn');
    const printBtn = document.getElementById('printTourneeBtn');

    console.log("Delete button:", deleteBtn);
    console.log("Print button:", printBtn);

    // -----------------------
    // Load dropdown options from API
    // -----------------------
    function loadDropdownOptions() {
        console.log("Loading dropdown options...");
        
        // Load drivers
        fetch("/api/drivers/")
            .then(response => {
                console.log("Drivers response status:", response.status);
                return response.json();
            })
            .then(drivers => {
                console.log("Drivers loaded:", drivers);
                const driverSelect = document.getElementById("driver");
                if (!driverSelect) {
                    console.error("Driver select element not found!");
                    return;
                }
                drivers.forEach(driver => {
                    const option = document.createElement("option");
                    option.value = driver.id;
                    option.textContent = `${driver.first_name} ${driver.last_name} - ${driver.license_number}`;
                    driverSelect.appendChild(option);
                });
                console.log("Drivers added to select:", driverSelect.options.length);
            })
            .catch(error => console.error("Error loading drivers:", error));

        // Load vehicles
        fetch("/api/vehicles/")
            .then(response => {
                console.log("Vehicles response status:", response.status);
                return response.json();
            })
            .then(vehicles => {
                console.log("Vehicles loaded:", vehicles);
                const vehicleSelect = document.getElementById("vehicle");
                if (!vehicleSelect) {
                    console.error("Vehicle select element not found!");
                    return;
                }
                vehicles.forEach(vehicle => {
                    const option = document.createElement("option");
                    option.value = vehicle.id;
                    option.textContent = `${vehicle.plate_number} - ${vehicle.brand} ${vehicle.model}`;
                    vehicleSelect.appendChild(option);
                });
                console.log("Vehicles added to select:", vehicleSelect.options.length);
            })
            .catch(error => console.error("Error loading vehicles:", error));
    }

    // Load options when page loads
    loadDropdownOptions();

    // -----------------------
    // Load available shipments in modal
    // -----------------------
    let availableShipmentsInModal = [];
    
    function loadShipmentsInModal() {
        const listContainer = document.getElementById("shipmentsListInModal");
        if (!listContainer) return;
        
        listContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">Chargement...</p>';
        
        fetch("/api/shipments/")
            .then(response => response.json())
            .then(shipments => {
                availableShipmentsInModal = shipments.filter(s => s.status === "disponible" && !s.tour);
                
                if (availableShipmentsInModal.length === 0) {
                    listContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">Aucune expédition disponible</p>';
                    return;
                }
                
                renderShipmentsInModal(availableShipmentsInModal);
            })
            .catch(error => {
                console.error("Error loading shipments:", error);
                listContainer.innerHTML = '<p style="text-align: center; color: #ef4444;">Erreur de chargement</p>';
            });
    }
    
    function renderShipmentsInModal(shipments) {
        const listContainer = document.getElementById("shipmentsListInModal");
        if (!listContainer) return;
        
        listContainer.innerHTML = shipments.map(shipment => `
            <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-bottom: 6px; background: white;">
                <label style="display: flex; align-items: start; cursor: pointer;">
                    <input type="checkbox" class="shipment-checkbox-modal" value="${shipment.id}" 
                           style="margin-top: 4px; margin-right: 10px;" onchange="updateShipmentCount()">
                    <div style="flex: 1; font-size: 13px;">
                        <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">
                            ${shipment.tracking_number}
                        </div>
                        <div style="color: #6b7280;">
                            <i class="bi bi-person"></i> ${shipment.client_name || shipment.client} • 
                            <i class="bi bi-geo-alt"></i> ${shipment.destination_name || shipment.destination}
                        </div>
                    </div>
                </label>
            </div>
        `).join('');
    }
    
    // Search in modal
    const searchInput = document.getElementById("searchShipmentsInModal");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = availableShipmentsInModal.filter(s => 
                s.tracking_number.toLowerCase().includes(searchTerm) ||
                (s.client_name && s.client_name.toLowerCase().includes(searchTerm)) ||
                (s.destination_name && s.destination_name.toLowerCase().includes(searchTerm))
            );
            renderShipmentsInModal(filtered);
        });
    }

    // -----------------------
    // Open & Close Modal
    // -----------------------
    if (openBtn && modal && closeBtn) {
        openBtn.addEventListener("click", () => {
            modal.style.display = "block";
            loadShipmentsInModal();  // Charger les expéditions quand le modal s'ouvre
        });

        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });

        window.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // -----------------------
    // Handle Delete Selected Tournees
    // -----------------------
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            // Get all checked checkboxes
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
            
            if (checkboxes.length === 0) {
                alert("Veuillez sélectionner au moins une tournée à supprimer.");
                return;
            }
            
            // Collect selected tournee IDs
            const tourneeIds = Array.from(checkboxes).map(cb => cb.value);
            
            // Confirm deletion
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${tourneeIds.length} tournée(s)?\nCette action est irréversible.`);
            
            if (!confirmDelete) {
                return;
            }
            
            // Delete each selected tournee
            const deletePromises = tourneeIds.map(id => {
                return fetch(`/api/tours/${id}/`, {
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
                        alert(`${tourneeIds.length} tournée(s) supprimée(s) avec succès!`);
                        location.reload();
                    } else {
                        throw new Error("Certaines tournées n'ont pas pu être supprimées.");
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
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            // Get selected shipments
            const selectedCheckboxes = document.querySelectorAll('.shipment-checkbox-modal:checked');
            const selectedShipmentIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));

            // Get form values
            const driverValue = document.getElementById("driver").value;
            const vehicleValue = document.getElementById("vehicle").value;
            const tourDate = document.getElementById("tour_date").value;

            // Validation
            if (!tourDate) {
                alert("Veuillez sélectionner une date pour la tournée");
                return;
            }
            if (!driverValue) {
                alert("Veuillez sélectionner un chauffeur");
                return;
            }
            if (!vehicleValue) {
                alert("Veuillez sélectionner un véhicule");
                return;
            }

            // Collect form data
            const data = {
                tour_date: tourDate,
                driver: parseInt(driverValue),
                vehicle: parseInt(vehicleValue),
                distance: parseFloat(document.getElementById("distance").value) || 0,
                duration: parseFloat(document.getElementById("duration").value) || 0,
                nb_exp: selectedShipmentIds.length,
                carb: 0,
                incd: 0,
                status: "disponible"
            };

            console.log("Creating tour with data:", data);
            console.log("Selected shipments:", selectedShipmentIds);

            // Step 1: Create the tour
            fetch("/api/tours/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken()
                },
                body: JSON.stringify(data)
            })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const message = errorData.detail || "Échec de création de la tournée";
                    throw new Error(message);
                }
                return response.json();
            })
            .then(createdTour => {
                console.log("Tour created:", createdTour);
                
                // Step 2: Assign selected shipments to the tour
                if (selectedShipmentIds.length === 0) {
                    alert("Tournée créée avec succès!");
                    form.reset();
                    modal.style.display = "none";
                    location.reload();
                    return;
                }
                
                // Update each shipment
                const updatePromises = selectedShipmentIds.map(shipmentId => {
                    return fetch(`/api/shipments/${shipmentId}/`)
                        .then(response => response.json())
                        .then(shipmentData => {
                            return fetch(`/api/shipments/${shipmentId}/`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    "X-CSRFToken": getCSRFToken()
                                },
                                body: JSON.stringify({
                                    ...shipmentData,
                                    tour: createdTour.id,
                                    status: "en_mission"
                                })
                            });
                        });
                });
                
                return Promise.all(updatePromises);
            })
            .then(responses => {
                const allSuccessful = responses.every(r => r.ok);
                
                if (allSuccessful) {
                    alert(`Tournée créée avec ${selectedShipmentIds.length} expédition(s) assignée(s)!`);
                    form.reset();
                    modal.style.display = "none";
                    location.reload();
                } else {
                    throw new Error("Certaines expéditions n'ont pas pu être assignées");
                }
            })
            .catch(error => {
                alert("Error creating tournee: " + error.message);
                console.error("API error:", error);
            });
        });
    }

});

// -----------------------
// Assign Shipments to Tour
// -----------------------
let currentTourId = null;
let availableShipments = [];

function openAssignModal(tourId) {
    currentTourId = tourId;
    const modal = document.getElementById("AssignShipmentsModal");
    modal.style.display = "block";
    
    // Load available shipments
    loadAvailableShipments();
}

function loadAvailableShipments() {
    const listContainer = document.getElementById("availableShipmentsList");
    listContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">Chargement...</p>';
    
    // Fetch shipments with status "disponible" and no tour assigned
    fetch("/api/shipments/")
        .then(response => response.json())
        .then(shipments => {
            availableShipments = shipments.filter(s => s.status === "disponible" && !s.tour);
            
            if (availableShipments.length === 0) {
                listContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">Aucune expédition disponible</p>';
                return;
            }
            
            renderShipmentsList(availableShipments);
        })
        .catch(error => {
            console.error("Error loading shipments:", error);
            listContainer.innerHTML = '<p style="text-align: center; color: #ef4444;">Erreur de chargement</p>';
        });
}

function renderShipmentsList(shipments) {
    const listContainer = document.getElementById("availableShipmentsList");
    
    listContainer.innerHTML = shipments.map(shipment => `
        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 8px; background: #f9fafb;">
            <label style="display: flex; align-items: start; cursor: pointer;">
                <input type="checkbox" class="shipment-checkbox" value="${shipment.id}" 
                       style="margin-top: 4px; margin-right: 10px;" onchange="updateSelectedCount()">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
                        ${shipment.tracking_number}
                    </div>
                    <div style="font-size: 13px; color: #6b7280;">
                        <span><i class="bi bi-person"></i> ${shipment.client_name || shipment.client}</span> • 
                        <span><i class="bi bi-geo-alt"></i> ${shipment.destination_name || shipment.destination}</span>
                    </div>
                    <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">
                        <span><i class="bi bi-box"></i> ${shipment.weight}kg / ${shipment.volume}m³</span> • 
                        <span><i class="bi bi-cash"></i> ${shipment.amount_ht} DA</span>
                    </div>
                </div>
            </label>
        </div>
    `).join('');
}

function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.shipment-checkbox:checked');
    const count = checkboxes.length;
    const countSpan = document.getElementById("selectedCount");
    const confirmBtn = document.getElementById("confirmAssignBtn");
    
    countSpan.textContent = `${count} expédition(s) sélectionnée(s)`;
    confirmBtn.disabled = count === 0;
}

// Handle modal close
document.addEventListener("DOMContentLoaded", function() {
    const assignModal = document.getElementById("AssignShipmentsModal");
    const closeAssignBtn = document.getElementById("closeAssignModal");
    
    if (closeAssignBtn) {
        closeAssignBtn.addEventListener("click", () => {
            assignModal.style.display = "none";
        });
    }
    
    window.addEventListener("click", (event) => {
        if (event.target === assignModal) {
            assignModal.style.display = "none";
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById("searchShipments");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = availableShipments.filter(s => 
                s.tracking_number.toLowerCase().includes(searchTerm) ||
                (s.client_name && s.client_name.toLowerCase().includes(searchTerm)) ||
                (s.destination_name && s.destination_name.toLowerCase().includes(searchTerm))
            );
            renderShipmentsList(filtered);
        });
    }
    
    // Confirm assignment
    const confirmBtn = document.getElementById("confirmAssignBtn");
    if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
            assignSelectedShipments();
        });
    }
});

function assignSelectedShipments() {
    const checkboxes = document.querySelectorAll('.shipment-checkbox:checked');
    const shipmentIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    if (shipmentIds.length === 0) {
        alert("Veuillez sélectionner au moins une expédition");
        return;
    }
    
    const confirmBtn = document.getElementById("confirmAssignBtn");
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Assignation...';
    
    // Update each shipment to assign it to the tour
    const updatePromises = shipmentIds.map(shipmentId => {
        // First fetch the shipment data
        return fetch(`/api/shipments/${shipmentId}/`)
            .then(response => response.json())
            .then(shipmentData => {
                // Update with tour assignment and change status
                return fetch(`/api/shipments/${shipmentId}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCSRFToken()
                    },
                    body: JSON.stringify({
                        ...shipmentData,
                        tour: currentTourId,
                        status: "en_mission"
                    })
                });
            });
    });
    
    Promise.all(updatePromises)
        .then(responses => {
            const allSuccessful = responses.every(r => r.ok);
            
            if (allSuccessful) {
                alert(`${shipmentIds.length} expédition(s) assignée(s) avec succès!`);
                document.getElementById("AssignShipmentsModal").style.display = "none";
                location.reload();
            } else {
                throw new Error("Certaines expéditions n'ont pas pu être assignées");
            }
        })
        .catch(error => {
            alert("Erreur lors de l'assignation: " + error.message);
            console.error("Assignment error:", error);
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-check-circle"></i> Assigner les expéditions';
        });
}

// -----------------------
// Update Tour Status
// -----------------------
function updateTourStatus(tourId, newStatus) {
    console.log(`Updating tour ${tourId} status to: ${newStatus}`);
    
    // Fetch current tour data
    fetch(`/api/tours/${tourId}/`)
        .then(response => response.json())
        .then(tourData => {
            // Update with new status
            return fetch(`/api/tours/${tourId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken()
                },
                body: JSON.stringify({
                    ...tourData,
                    status: newStatus
                })
            });
        })
        .then(response => {
            if (response.ok) {
                console.log(`Tour ${tourId} status updated successfully`);
                // Optionally show a success message
                // alert("Statut mis à jour!");
            } else {
                throw new Error("Failed to update tour status");
            }
        })
        .catch(error => {
            console.error("Error updating tour status:", error);
            alert("Erreur lors de la mise à jour du statut");
            location.reload(); // Reload to revert the select value
        });
}

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