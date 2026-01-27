document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddExpeditionButton");
    const modal = document.getElementById("AddExpeditionModal"); // Fixed: Capital M
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addExpeditionForm");
    const deleteBtn = document.getElementById('deleteExpeditionBtn');
    const printBtn = document.getElementById('printExpeditionBtn');

    console.log("Delete button:", deleteBtn);
    console.log("Print button:", printBtn);

    // -----------------------
    // Handle Select All Checkbox
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

    // -----------------------
    // Load dropdown options from API
    // -----------------------
    function loadDropdownOptions() {
        // Load clients
        fetch("/api/clients/")
            .then(response => response.json())
            .then(clients => {
                const clientSelect = document.getElementById("client");
                clients.forEach(client => {
                    const option = document.createElement("option");
                    option.value = client.id;
                    option.textContent = `${client.first_name} ${client.last_name} - ${client.email}`;
                    clientSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error loading clients:", error));

        // Load destinations
        fetch("/api/destinations/")
            .then(response => response.json())
            .then(destinations => {
                const destSelect = document.getElementById("destination");
                destinations.forEach(dest => {
                    const option = document.createElement("option");
                    option.value = dest.id;
                    option.textContent = `${dest.city}, ${dest.country} (Zone: ${dest.zone})`;
                    destSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error loading destinations:", error));

        // Load services
        fetch("/api/services/")
            .then(response => response.json())
            .then(services => {
                const serviceSelect = document.getElementById("service");
                services.forEach(service => {
                    const option = document.createElement("option");
                    option.value = service.id;
                    option.textContent = `${service.label} (${service.estimated_delay} days) - $${service.price}`;
                    serviceSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error loading services:", error));

        // Load invoices
        fetch("/api/invoices/")
            .then(response => response.json())
            .then(invoices => {
                const invoiceSelect = document.getElementById("invoice");
                invoices.forEach(invoice => {
                    const option = document.createElement("option");
                    option.value = invoice.id;
                    option.textContent = `Facture #${invoice.id} - ${invoice.client_name || invoice.client} (${invoice.status})`;
                    invoiceSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error loading invoices:", error));
    }

    // Load options when page loads
    loadDropdownOptions();

    // -----------------------
    // Open & Close Modal
    // -----------------------
    if (openBtn) {
        openBtn.addEventListener("click", () => {
            modal.style.display = "block";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // -----------------------
    // Handle form submission
    // -----------------------
    if (form) {
        form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Collect form data as JSON
        const invoiceValue = document.getElementById("invoice").value;
        const data = {
            shipment_date: document.getElementById("shipment_date").value,
            client: parseInt(document.getElementById("client").value),
            destination: parseInt(document.getElementById("destination").value),
            service: parseInt(document.getElementById("service").value),
            weight: parseFloat(document.getElementById("weight").value),
            volume: parseFloat(document.getElementById("volume").value),
            description: document.getElementById("description").value,
            status: document.getElementById("status").value
        };
        
        // Only add invoice if one is selected
        if (invoiceValue && invoiceValue !== "") {
            data.invoice = parseInt(invoiceValue);
        }

        // Send POST request to API
        fetch("/api/shipments/", {
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
                console.log("Full error data:", errorData);
                const message = JSON.stringify(errorData, null, 2);
                throw new Error(message);
            }
            return response.json();
        })
        .then(createdExpedition => {
            console.log("Expedition created:", createdExpedition);

            // Add the new row to the table
            const tbody = document.querySelector("table tbody");
            if (tbody) {
                // Determine status badge class
                let statusClass = "status-badge";
                if (createdExpedition.status === "disponible") {
                    statusClass += " status-disponible";
                } else if (createdExpedition.status === "offline") {
                    statusClass += " status-offline";
                } else if (createdExpedition.status === "en_mission") {
                    statusClass += " status-en_mission";
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="id-col">
                        <input type="checkbox" value="${createdExpedition.id}">
                        EXP-${createdExpedition.id}
                    </td>
                    <td>${createdExpedition.client}</td>
                    <td>${createdExpedition.destination}</td>
                    <td>${createdExpedition.service}</td>
                    <td>${createdExpedition.poid} kg</td>
                    <td>${createdExpedition.volume} m³</td>
                    <td>${createdExpedition.montant}</td>
                    <td class="status">
                        <span class="${statusClass}">${createdExpedition.status}</span>
                    </td>
                `;
                tbody.prepend(tr);
            }

            // Clear form & close modal
            form.reset();
            modal.style.display = "none";
        })
        .catch(error => {
            alert("Error creating expedition: " + error.message);
            console.error("API error:", error);
        });
    });
    }

    // -----------------------
    // Handle Delete Selected Shipments
    // -----------------------
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
            
            if (checkboxes.length === 0) {
                alert("Veuillez sélectionner au moins une expédition à supprimer.");
                return;
            }
            
            const shipmentIds = Array.from(checkboxes).map(cb => cb.value);
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${shipmentIds.length} expédition(s)?\nCette action est irréversible.`);
            
            if (!confirmDelete) {
                return;
            }
            
            const deletePromises = shipmentIds.map(id => {
                return fetch(`/api/shipments/${id}/`, {
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
                        alert(`${shipmentIds.length} expédition(s) supprimée(s) avec succès!`);
                        location.reload();
                    } else {
                        throw new Error("Certaines expéditions n'ont pas pu être supprimées.");
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