document.addEventListener('DOMContentLoaded', function () {
    console.log('=== SUIVI.JS LOADED ===');
    
    const checkboxes = document.querySelectorAll('.expedition-checkbox');
    const rows = document.querySelectorAll('.expedition-row');

    console.log('Found checkboxes:', checkboxes.length);
    console.log('Found rows:', rows.length);

    // Gestion du modal historique
    const historiqueBtn = document.querySelector('.history-btn');
    const modal = document.getElementById('historiqueModal');
    const closeBtn = document.getElementById('closeModal');

    // Fonction pour charger les détails d'une expédition
    function loadExpeditionDetails(expeditionId) {
        console.log('=== DÉBUT CHARGEMENT ===');
        console.log('Loading details for expedition ID:', expeditionId);
        
        // Vérifier que les éléments existent AVANT de faire la requête
        const clientNameEl = document.getElementById('client-name');
        const creationDateEl = document.getElementById('creation-date');
        const destinationNameEl = document.getElementById('destination-name');
        const weightVolumeEl = document.getElementById('weight-volume');
        const serviceTypeEl = document.getElementById('service-type');
        const amountEl = document.getElementById('amount');
        const descriptionEl = document.getElementById('description');
        const incidentEl = document.getElementById('incident');
        
        console.log('Éléments trouvés:');
        console.log('- client-name:', clientNameEl);
        console.log('- creation-date:', creationDateEl);
        console.log('- destination-name:', destinationNameEl);
        console.log('- weight-volume:', weightVolumeEl);
        console.log('- service-type:', serviceTypeEl);
        console.log('- amount:', amountEl);
        console.log('- description:', descriptionEl);
        console.log('- incident:', incidentEl);
        
        fetch(`/api/shipments/${expeditionId}/`)
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('=== DONNÉES REÇUES ===');
                console.log('Received data:', data);
                
                // Mettre à jour les informations
                if (clientNameEl) {
                    clientNameEl.textContent = data.client_name || 'N/A';
                    console.log('✅ Client name mis à jour:', clientNameEl.textContent);
                } else {
                    console.error('❌ Element client-name NOT FOUND');
                }
                
                if (creationDateEl) {
                    creationDateEl.textContent = data.shipment_date || 'N/A';
                    console.log('✅ Date mise à jour:', creationDateEl.textContent);
                } else {
                    console.error('❌ Element creation-date NOT FOUND');
                }
                
                if (destinationNameEl) {
                    destinationNameEl.textContent = data.destination_name || 'N/A';
                    console.log('✅ Destination mise à jour:', destinationNameEl.textContent);
                } else {
                    console.error('❌ Element destination-name NOT FOUND');
                }
                
                if (weightVolumeEl) {
                    weightVolumeEl.textContent = `${data.weight}kg/${data.volume}m³`;
                    console.log('✅ Poids/Volume mis à jour:', weightVolumeEl.textContent);
                } else {
                    console.error('❌ Element weight-volume NOT FOUND');
                }
                
                if (serviceTypeEl) {
                    serviceTypeEl.textContent = data.service_name || 'N/A';
                    console.log('✅ Service mis à jour:', serviceTypeEl.textContent);
                } else {
                    console.error('❌ Element service-type NOT FOUND');
                }
                
                if (amountEl) {
                    amountEl.textContent = `${data.amount_ht} DA`;
                    console.log('✅ Montant mis à jour:', amountEl.textContent);
                } else {
                    console.error('❌ Element amount NOT FOUND');
                }
                
                if (descriptionEl) {
                    descriptionEl.textContent = data.description || 'Aucune description';
                    console.log('✅ Description mise à jour:', descriptionEl.textContent);
                } else {
                    console.error('❌ Element description NOT FOUND');
                }
                
                if (incidentEl) {
                    incidentEl.textContent = 'No incident';
                    console.log('✅ Incident mis à jour');
                } else {
                    console.error('❌ Element incident NOT FOUND');
                }
                
                console.log('=== MISE À JOUR TERMINÉE ===');
            })
            .catch(error => {
                console.error('❌ ERREUR:', error);
                alert('Erreur lors du chargement: ' + error.message);
            });
    }

    // Gestion des checkboxes - un seul sélectionné à la fois
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            console.log('Checkbox changed:', this.checked, 'ID:', this.getAttribute('data-expedition-id'));
            
            // Décocher les autres
            checkboxes.forEach(cb => {
                if (cb !== this) cb.checked = false;
            });
            
            // Charger les détails si une checkbox est cochée
            if (this.checked) {
                const expeditionId = this.getAttribute('data-expedition-id');
                console.log('Loading expedition:', expeditionId);
                loadExpeditionDetails(expeditionId);
            }
        });
    });

    // Clic sur la ligne pour sélectionner
    rows.forEach(row => {
        row.addEventListener('click', function (e) {
            if (e.target.type !== 'checkbox') {
                const checkbox = this.querySelector('.expedition-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            }
        });
    });

    // Ouvrir le modal
    if (historiqueBtn && modal) {
        historiqueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Fermer le modal avec le bouton X
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Fermer le modal en cliquant en dehors
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});