document.addEventListener('DOMContentLoaded', function () {
    console.log('=== SUIVI.JS LOADED ===');
    
    // ========================================
    // NOUVELLE FONCTIONNALITÉ : RECHERCHE
    // ========================================
    const searchInput = document.getElementById("search");
    
    if (searchInput) {
        let timeout = null;
        
        searchInput.addEventListener("input", function() {
            clearTimeout(timeout);
            
            timeout = setTimeout(() => {
                const searchValue = searchInput.value.trim();
                let url = window.location.pathname + '?';
                
                if (searchValue) {
                    url += `search=${encodeURIComponent(searchValue)}`;
                }
                
                window.location.href = url;
            }, 500);
        });
        
        // Recherche avec Enter
        searchInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                clearTimeout(timeout);
                
                const searchValue = searchInput.value.trim();
                let url = window.location.pathname + '?';
                
                if (searchValue) {
                    url += `search=${encodeURIComponent(searchValue)}`;
                }
                
                window.location.href = url;
            }
        });
    }
    
    const checkboxes = document.querySelectorAll('.expedition-checkbox');
    const rows = document.querySelectorAll('.expedition-row');
    let selectedExpeditionId = null;
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
        
        // Stocker l'ID sélectionné
        selectedExpeditionId = expeditionId;
        
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
                    console.log('Client name mis à jour:', clientNameEl.textContent);
                } else {
                    console.error('Element client-name NOT FOUND');
                }
                
                if (creationDateEl) {
                    creationDateEl.textContent = data.shipment_date || 'N/A';
                    console.log('Date mise à jour:', creationDateEl.textContent);
                } else {
                    console.error('Element creation-date NOT FOUND');
                }
                
                if (destinationNameEl) {
                    destinationNameEl.textContent = data.destination_name || 'N/A';
                    console.log('Destination mise à jour:', destinationNameEl.textContent);
                } else {
                    console.error('Element destination-name NOT FOUND');
                }
                
                if (weightVolumeEl) {
                    weightVolumeEl.textContent = `${data.weight}kg/${data.volume}m³`;
                    console.log('Poids/Volume mis à jour:', weightVolumeEl.textContent);
                } else {
                    console.error('Element weight-volume NOT FOUND');
                }
                
                if (serviceTypeEl) {
                    serviceTypeEl.textContent = data.service_name || 'N/A';
                    console.log('Service mis à jour:', serviceTypeEl.textContent);
                } else {
                    console.error('Element service-type NOT FOUND');
                }
                
                if (amountEl) {
                    amountEl.textContent = `${data.amount_ht} DA`;
                    console.log('Montant mis à jour:', amountEl.textContent);
                } else {
                    console.error('Element amount NOT FOUND');
                }
                
                if (descriptionEl) {
                    descriptionEl.textContent = data.description || 'Aucune description';
                    console.log('Description mise à jour:', descriptionEl.textContent);
                } else {
                    console.error('Element description NOT FOUND');
                }
                
                if (incidentEl) {
                    incidentEl.textContent = 'No incident';
                    console.log('Incident mis à jour');
                } else {
                    console.error('Element incident NOT FOUND');
                }
                
                console.log('=== MISE À JOUR TERMINÉE ===');
            })
            .catch(error => {
                console.error('ERREUR:', error);
                alert('Erreur lors du chargement: ' + error.message);
            });
    }

    // Fonction pour charger l'historique d'une expédition
    function loadExpeditionHistory(expeditionId) {
        console.log('=== CHARGEMENT HISTORIQUE ===');
        console.log('Loading history for expedition ID:', expeditionId);
        
        const timelineContainer = document.querySelector('.timeline');
        
        if (!timelineContainer) {
            console.error('Timeline container NOT FOUND');
            return;
        }
        
        // Afficher un loader
        timelineContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 1rem; color: #6b7280;">Chargement de l'historique...</p>
            </div>
        `;
        
        fetch(`/api/shipments/${expeditionId}/history/`)
            .then(response => {
                console.log('History response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('=== HISTORIQUE REÇU ===');
                console.log('History data:', data);
                
                // Vider le conteneur
                timelineContainer.innerHTML = '';
                
                // Vérifier si des données existent
                if (!data.history || data.history.length === 0) {
                    timelineContainer.innerHTML = `
                        <div style="text-align: center; padding: 2rem; color: #6b7280;">
                            <p>Aucun historique disponible pour cette expédition.</p>
                        </div>
                    `;
                    return;
                }
                
                // Créer les éléments de timeline pour chaque événement
                data.history.forEach((event, index) => {
                    const timelineItem = createTimelineItem(event, index);
                    timelineContainer.appendChild(timelineItem);
                });
                
                console.log('Historique chargé avec succès');
            })
            .catch(error => {
                console.error('ERREUR HISTORIQUE:', error);
                timelineContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #ef4444;">
                        <p>Erreur lors du chargement de l'historique</p>
                        <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
                    </div>
                `;
            });
    }

    // Fonction pour créer un élément de timeline
    function createTimelineItem(event, index) {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        
        // Déterminer l'icône et la classe en fonction du statut
        let iconHTML = '';
        let iconClass = '';
        
        switch(event.status?.toLowerCase()) {
            case 'en cours de livraison':
            case 'livraison':
                iconClass = 'truck-icon';
                iconHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                `;
                break;
            case 'en centre de tri':
            case 'centre de tri':
                iconClass = 'center-icon';
                iconHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
                break;
            case 'en transit':
            case 'transit':
                iconClass = 'truck-icon';
                iconHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                `;
                break;
            case 'créée':
            case 'expédition créée':
                iconClass = 'created-icon';
                iconHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                `;
                break;
            default:
                iconClass = 'created-icon';
                iconHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                `;
        }
        
        div.innerHTML = `
            <div class="timeline-icon ${iconClass}">
                ${iconHTML}
            </div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <h4>${event.status || 'Événement'}</h4>
                    <span class="timeline-date">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${event.date || 'Date inconnue'}
                    </span>
                </div>
                <div class="timeline-details">
                    ${event.location ? `
                        <div class="detail-line">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${event.location}
                        </div>
                    ` : ''}
                    ${event.driver ? `
                        <div class="detail-line">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Chauffeur : ${event.driver}
                        </div>
                    ` : ''}
                    ${event.message ? `
                        <div class="detail-line message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            ${event.message}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        return div;
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
            } else {
                selectedExpeditionId = null;
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
            
            // Vérifier qu'une expédition est sélectionnée
            if (!selectedExpeditionId) {
                alert('Veuillez sélectionner une expédition pour voir son historique.');
                return;
            }
            
            // Ouvrir le modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Charger l'historique
            loadExpeditionHistory(selectedExpeditionId);
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
    
    // Ajouter l'animation de spin pour le loader
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});