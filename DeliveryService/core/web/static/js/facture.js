document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddFactureButton");
    const modal = document.getElementById("addFactureModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addFactureForm");
    const deleteBtn = document.querySelector('.btn.danger');
    const printBtn = document.querySelector('.btn.light');

    // -----------------------
    // Open & Close Modal
    // -----------------------
    if (openBtn && modal && closeBtn && form) {
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
            event.preventDefault();

            // Collect form data - le backend calcule automatiquement TVA, TTC, rest
            const data = {
                client: parseInt(form.client.value, 10),
                invoice_date: form.invoice_date.value,
                amount_ht: parseFloat(form.amount_ht.value) || 0,
                status: form.status ? form.status.value : 'non-payee' // Optionnel si le champ existe
            };

            console.log("Données facture à envoyer:", data);

            // Send POST request to API
            fetch("/api/invoices/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken()
                },
                body: JSON.stringify(data)
            })
            .then(async response => {
                const responseText = await response.text();
                console.log("Réponse brute du serveur:", responseText);
                
                if (!response.ok) {
                    let errorData = {};
                    try {
                        errorData = JSON.parse(responseText);
                    } catch (e) {
                        console.error("Impossible de parser la réponse:", responseText);
                    }
                    
                    console.error("Erreur du serveur:", errorData);
                    
                    // Afficher les erreurs de validation
                    let errorMessage = "Failed to create invoice";
                    if (errorData.client) {
                        errorMessage = "Client: " + (Array.isArray(errorData.client) ? errorData.client.join(", ") : errorData.client);
                    } else if (errorData.invoice_date) {
                        errorMessage = "Date: " + (Array.isArray(errorData.invoice_date) ? errorData.invoice_date.join(", ") : errorData.invoice_date);
                    } else if (errorData.amount_ht) {
                        errorMessage = "Montant HT: " + (Array.isArray(errorData.amount_ht) ? errorData.amount_ht.join(", ") : errorData.amount_ht);
                    } else if (errorData.detail) {
                        errorMessage = errorData.detail;
                    } else if (errorData.non_field_errors) {
                        errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(", ") : errorData.non_field_errors;
                    }
                    
                    throw new Error(errorMessage);
                }
                
                return JSON.parse(responseText);
            })
            .then(createdInvoice => {
                console.log("Facture créée:", createdInvoice);

                // Add new row to table
                const tbody = document.querySelector("table tbody");
                if (tbody) {
                    let statusClass = "status-badge";
                    if (createdInvoice.status === "payee") {
                        statusClass += " status-disponible";
                    } else if (createdInvoice.status === "non-payee") {
                        statusClass += " status-offline";
                    } else if (createdInvoice.status === "part-payee") {
                        statusClass += " status-en_mission";
                    }

                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="id-col">
                            <label>
                                <input type="checkbox" value="${createdInvoice.id}">
                                ${createdInvoice.id}
                            </label>
                        </td>
                        <td>${createdInvoice.client}</td>
                        <td>${createdInvoice.invoice_date}</td>
                        <td>${createdInvoice.amount_ht.toFixed(2)} DA</td>
                        <td>${createdInvoice.amount_vat.toFixed(2)} DA</td>
                        <td>${createdInvoice.amount_ttc.toFixed(2)} DA</td>
                        <td>${createdInvoice.rest.toFixed(2)} DA</td>
                        <td class="status">
                            <span class="${statusClass}">${createdInvoice.status}</span>
                        </td>
                    `;
                    tbody.prepend(tr);
                }

                // Clear form & close modal
                form.reset();
                modal.style.display = "none";
                alert("Facture créée avec succès!");
            })
            .catch(error => {
                alert("Erreur lors de la création de la facture: " + error.message);
                console.error("API error:", error);
            });
        });
    }

    // -----------------------
    // Handle Delete Selected Invoices
    // -----------------------
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
            
            if (checkboxes.length === 0) {
                alert("Veuillez sélectionner au moins une facture à supprimer.");
                return;
            }
            
            const invoiceIds = Array.from(checkboxes).map(cb => cb.value);
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${invoiceIds.length} facture(s)?\nCette action est irréversible.`);
            
            if (!confirmDelete) {
                return;
            }
            
            const deletePromises = invoiceIds.map(id => {
                return fetch(`/api/invoices/${id}/`, {
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
                        alert(`${invoiceIds.length} facture(s) supprimée(s) avec succès!`);
                        location.reload();
                    } else {
                        throw new Error("Certaines factures n'ont pas pu être supprimées.");
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