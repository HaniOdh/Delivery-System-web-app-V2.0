document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddPaiementButton");
    const modal = document.getElementById("addPaiementModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addPaiementForm");
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

            const invoiceId = parseInt(form.invoice.value, 10);
            const amountPaid = parseFloat(form.amount.value) || 0;

            // Collect payment data
            const paymentData = {
                invoice: invoiceId,
                client: parseInt(form.client.value, 10),
                payment_date: form.payment_date.value,
                amount: amountPaid,
                payment_method: form.payment_method.value
            };

            console.log("Données paiement à envoyer:", paymentData);

            const csrfInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
            const csrfToken = (csrfInput && csrfInput.value) || getCSRFToken();

            // First, fetch the invoice to validate payment amount
            fetch(`/api/invoices/${invoiceId}/`, {
                headers: {
                    "X-CSRFToken": csrfToken,
                },
                credentials: "same-origin"
            })
            .then(async response => {
                if (!response.ok) {
                    throw new Error("Facture introuvable");
                }
                return response.json();
            })
            .then(invoice => {
                console.log("Facture récupérée:", invoice);
                
                // Validate payment amount
                if (amountPaid <= 0) {
                    throw new Error("Le montant du paiement doit être supérieur à 0");
                }
                
                if (amountPaid > invoice.rest) {
                    throw new Error(`Le montant du paiement (${amountPaid.toFixed(2)} DA) ne peut pas dépasser le reste à payer (${invoice.rest.toFixed(2)} DA)`);
                }

                // Send payment
                return fetch("/api/payments/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    credentials: "same-origin",
                    body: JSON.stringify(paymentData)
                });
            })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const message = errorData.detail || "Échec de la création du paiement";
                    throw new Error(message);
                }
                return response.json();
            })
            .then(async createdPayment => {
                console.log("Paiement créé:", createdPayment);

                // Fetch updated invoice to show new status
                try {
                    const invoiceResponse = await fetch(`/api/invoices/${createdPayment.invoice}/`, {
                        headers: {
                            "X-CSRFToken": csrfToken,
                        },
                        credentials: "same-origin"
                    });
                    
                    if (invoiceResponse.ok) {
                        const updatedInvoice = await invoiceResponse.json();
                        console.log("Facture mise à jour:", updatedInvoice);
                        
                        // Format status for display
                        let statusDisplay = updatedInvoice.status;
                        switch(updatedInvoice.status) {
                            case 'payee':
                                statusDisplay = '✅ PAYÉE';
                                break;
                            case 'part-payee':
                                statusDisplay = '🟡 PARTIELLEMENT PAYÉE';
                                break;
                            case 'non-payee':
                                statusDisplay = '❌ NON PAYÉE';
                                break;
                        }
                        
                        // Calculate TVA amount
                        const tvaAmount = updatedInvoice.amount_ht * updatedInvoice.amount_vat;
                        
                        alert(`✓ Paiement enregistré avec succès!
                        
═══════════════════════════════════════
Facture: INV-${updatedInvoice.id}
Client: ${createdPayment.client}
Méthode: ${createdPayment.payment_method}
Date: ${createdPayment.payment_date}
═══════════════════════════════════════

💰 DÉTAILS FINANCIERS:
──────────────────────────────────────
Montant HT:      ${updatedInvoice.amount_ht.toFixed(2)} DA
TVA (19%):       ${tvaAmount.toFixed(2)} DA
Total TTC:       ${updatedInvoice.amount_ttc.toFixed(2)} DA
──────────────────────────────────────
Montant payé:    ${amountPaid.toFixed(2)} DA
Reste à payer:   ${updatedInvoice.rest.toFixed(2)} DA
──────────────────────────────────────
Statut: ${statusDisplay}
═══════════════════════════════════════
                        `);
                    } else {
                        alert("✓ Paiement enregistré avec succès!\nLe reste et le statut de la facture ont été mis à jour automatiquement.");
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération de la facture:", error);
                    alert("✓ Paiement enregistré avec succès!\nLe reste et le statut de la facture ont été mis à jour automatiquement.");
                }

                // Clear form & close modal
                form.reset();
                modal.style.display = "none";
                
                // Recharger la page pour afficher les nouvelles données
                window.location.reload();
            })
            .catch(error => {
                alert("Erreur: " + error.message);
                console.error("Erreur complète:", error);
            });
        });
    }

    // -----------------------
    // Handle Delete Selected Payments
    // -----------------------
    if (deleteBtn) {
        deleteBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
            
            if (checkboxes.length === 0) {
                alert("Veuillez sélectionner au moins un paiement à supprimer.");
                return;
            }
            
            const paymentIds = Array.from(checkboxes).map(cb => cb.value);
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer ${paymentIds.length} paiement(s)?\nCette action est irréversible.`);
            
            if (!confirmDelete) {
                return;
            }
            
            const deletePromises = paymentIds.map(id => {
                return fetch(`/api/payments/${id}/`, {
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
                        alert(`${paymentIds.length} paiement(s) supprimé(s) avec succès!`);
                        location.reload();
                    } else {
                        throw new Error("Certains paiements n'ont pas pu être supprimés.");
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