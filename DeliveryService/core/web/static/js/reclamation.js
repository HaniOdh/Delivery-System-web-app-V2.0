document.addEventListener("DOMContentLoaded", function()  {
    const openBtn = document.getElementById("AddReclamationButton");
    const modal = document.getElementById("addReclamationModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addReclamationForm");

    function loadDropdownOptions() {
        console.log("Loading dropdown options...");
        
        // Load drivers
        fetch("/api/shipments/")
            .then(response => {
                console.log("Shipments response status:", response.status);
                return response.json();
            })
            .then(shipments => {
                console.log("Shipments loaded:", shipments);
                const shipmentSelect = document.getElementById("shipment");
                if (!shipmentSelect) {
                    console.error("Shipment select element not found!");
                    return;
                }
                shipments.forEach(shipment => {
                    const option = document.createElement("option");
                    option.value = shipment.id;
                    const clientName = shipment.client_name || `Client #${shipment.client}`;
                    const destName = shipment.destination_name || `Destination #${shipment.destination}`;
                    option.textContent = `${shipment.tracking_number} - ${clientName} to ${destName}`;
                    shipmentSelect.appendChild(option);
                });
                console.log("Shipments added to select:", shipmentSelect.options.length);
            })
            .catch(error => console.error("Error loading shipments:", error));
        console.log("Loading clients...");
        
        fetch("/api/clients/")
            .then(response => {
                console.log("Clients response status:", response.status);
                return response.json();
            })
            .then(clients => {
                console.log("Clients loaded:", clients);
                const clientSelect = document.getElementById("client");
                if (!clientSelect) {
                    console.error("Client select element not found!");
                    return;
                }
                clientSelect.innerHTML = '<option value="">-- Sélectionner un client --</option>';
                clients.forEach(client => {
                    const option = document.createElement("option");
                    option.value = client.id;
                    option.textContent = `${client.first_name} ${client.last_name}${client.email ? ' (' + client.email + ')' : ''}`;
                    clientSelect.appendChild(option);
                });
                
                console.log("Clients added to select:", clientSelect.options.length);
            })
            .catch(error => {
                console.error("Error loading clients:", error);
                alert("Impossible de charger la liste des clients");
            });
    }

    loadDropdownOptions();
    
    if (!openBtn || !modal || !closeBtn || !form) {
        return; // required elements missing on page
    }

    // Open/close modal
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

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const datePart = form.complaint_date.value;
        const timePart = form.complaint_time.value;
        const complaintDateTime = datePart && timePart ? `${datePart}T${timePart}:00` : datePart;

        const data = {
            subject: form.subject.value.trim(),
            description: form.description.value.trim(),
            complaint_date: complaintDateTime,
            status: form.status.value,
            client: form.client.value ? parseInt(form.client.value, 10) : null,
            shipment: form.shipment.value ? parseInt(form.shipment.value, 10) : null,
        };

        fetch("/api/complaints/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify(data),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const message =
                        errorData.detail ||
                        errorData.error ||
                        JSON.stringify(errorData) ||
                        "Failed to create reclamation";
                    throw new Error(message);
                }
                return response.json();
            })
            .then(() => {
                // Refresh to show the new reclamation in the list
                window.location.reload();
            })
            .catch((error) => {
                alert("Erreur lors de la création de la réclamation: " + error.message);
                console.error("API error:", error);
            });
    });
});

function getCSRFToken() {
    let cookieValue = null;
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith("csrftoken=")) {
            cookieValue = trimmed.substring("csrftoken=".length);
            break;
        }
    }
    return cookieValue;
}

function updateReclamationStatus(selectElement) {
    const reclamationId = selectElement.getAttribute('data-reclamation-id');
    const newStatus = selectElement.value;
    
    console.log('Updating reclamation:', reclamationId, 'to status:', newStatus);
    
    // First, get the current complaint data
    fetch(`/api/complaints/${reclamationId}/`)
        .then(response => response.json())
        .then(currentData => {
            // Update with PUT (requires all fields)
            const updatedData = {
                ...currentData,
                status: newStatus
            };
            
            return fetch(`/api/complaints/${reclamationId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify(updatedData)
            });
        })
    .then(async response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error data:', errorData);
            const message = JSON.stringify(errorData, null, 2);
            throw new Error(message || 'Failed to update status');
        }
        return response.json();
    })
    .then(data => {
        console.log('Status updated successfully:', data);
        alert('Statut mis à jour avec succès!');
    })
    .catch(error => {
        console.error('Error updating status:', error);
        alert('Erreur lors de la mise à jour du statut:\n' + error.message);
        // Revert to previous value on error
        location.reload();
    });
}
