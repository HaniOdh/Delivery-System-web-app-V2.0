// ============================================
// FAVORIS - Gestion des fonctionnalités favorites
// ============================================

const STORAGE_KEY = "delivery-favorites";

const allFeatures = [
    // Expéditions
    {
        id: "expedition-new",
        title: "Nouvelle expédition",
        description: "Créer et planifier une nouvelle expédition",
        icon: "📦",
        url: "/expedition/"
    },
    {
        id: "expedition-suivi",
        title: "Suivi des colis",
        description: "Suivre en temps réel la position des colis",
        icon: "📡",
        url: "/expedition/suivi/"
    },
    {
        id: "expedition-tournee",
        title: "Gestion des tournées",
        description: "Planifier et gérer les tournées de livraison",
        icon: "🔗",
        url: "/expedition/tournee/"
    },
    
    // Facturation
    {
        id: "billing",
        title: "Facturation",
        description: "Gérer les factures clients",
        icon: "💳",
        url: "/facturation/"
    },
    {
        id: "payments",
        title: "Paiements",
        description: "Suivre et gérer les paiements",
        icon: "💰",
        url: "/facturation/paiements/"
    },
    
    // Gestion Tables
    {
        id: "clients",
        title: "Clients",
        description: "Gérer la base de données clients",
        icon: "👤",
        url: "/table/clients/"
    },
    {
        id: "agents",
        title: "Agents",
        description: "Gérer les agents du système",
        icon: "👔",
        url: "/table/agents/"
    },
    {
        id: "drivers",
        title: "Chauffeurs",
        description: "Gérer les chauffeurs et conducteurs",
        icon: "🚚",
        url: "/table/drivers/"
    },
    {
        id: "vehicles",
        title: "Véhicules",
        description: "Suivre et maintenir la flotte de véhicules",
        icon: "🚛",
        url: "/table/vehicles/"
    },
    {
        id: "destinations",
        title: "Destinations",
        description: "Gérer les destinations et zones de livraison",
        icon: "🗺️",
        url: "/table/destinations/"
    },
    {
        id: "tarification",
        title: "Tarification",
        description: "Configurer les grilles tarifaires",
        icon: "💲",
        url: "/table/tarification/"
    },
    {
        id: "services-types",
        title: "Types de services",
        description: "Gérer les types de services proposés",
        icon: "🛠️",
        url: "/table/services-types/"
    },
    
    // Incidents et Réclamations
    {
        id: "incidents",
        title: "Incidents",
        description: "Gérer et résoudre les incidents",
        icon: "⚠️",
        url: "/incident/"
    },
    {
        id: "incident-statistics",
        title: "Statistiques incidents",
        description: "Consulter les statistiques des incidents",
        icon: "📈",
        url: "/incident/statistics/"
    },
    {
        id: "reclamations",
        title: "Réclamations",
        description: "Traiter les réclamations clients",
        icon: "📝",
        url: "/reclamation/"
    },
    
    // Autres
    {
        id: "table-general",
        title: "Tables",
        description: "Accès général aux tables de données",
        icon: "📊",
        url: "/table/"
    },
    {
        id: "favoris",
        title: "Favoris",
        description: "Gérer vos fonctionnalités favorites",
        icon: "⭐",
        url: "/favoris/"
    }
];

const defaultFavoriteIds = ["expedition-new", "expedition-suivi", "billing", "clients"];

let favorites = [];
let favContainer;
let modalOverlay;
let featureListEl;

function loadFavorites() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (err) {
        console.warn("Impossible de charger les favoris", err);
    }
    return defaultFavoriteIds;
}

function saveFavorites() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function featureById(id) {
    return allFeatures.find((f) => f.id === id);
}

function renderFavorites() {
    if (!favContainer) {
        console.error("favContainer non trouvé");
        return;
    }

    favContainer.innerHTML = "";

    if (!favorites.length) {
        favContainer.innerHTML = '<p class="text-muted">Aucun favori pour le moment. Cliquez sur "Personnaliser" pour en ajouter.</p>';
        return;
    }

    favorites.forEach((id) => {
        const feature = featureById(id);
        if (!feature) {
            return;
        }

        const card = document.createElement("div");
        card.className = "card";
        card.style.cursor = "pointer";
        
        // Add click handler to navigate
        card.addEventListener("click", (e) => {
            // Don't navigate if clicking the remove button
            if (!e.target.classList.contains("remove-btn")) {
                window.location.href = feature.url;
            }
        });

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-btn";
        removeBtn.title = "Supprimer";
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            removeFavorite(id);
        });

        const icon = document.createElement("div");
        icon.className = "icon";
        icon.textContent = feature.icon;

        const title = document.createElement("h3");
        title.textContent = feature.title;

        const desc = document.createElement("p");
        desc.textContent = feature.description;

        card.appendChild(removeBtn);
        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(desc);

        favContainer.appendChild(card);
    });
}

function renderFeatureList() {
    if (!featureListEl) {
        console.error("featureListEl non trouvé");
        return;
    }

    featureListEl.innerHTML = "";

    allFeatures.forEach((feature) => {
        const wrapper = document.createElement("div");
        wrapper.className = "feature-item";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = `feature-${feature.id}`;
        input.name = "feature";
        input.value = feature.id;
        input.checked = favorites.includes(feature.id);

        const label = document.createElement("label");
        label.htmlFor = input.id;
        label.textContent = feature.title;

        const desc = document.createElement("small");
        desc.textContent = feature.description;

        wrapper.appendChild(input);
        const textWrapper = document.createElement("div");
        textWrapper.appendChild(label);
        textWrapper.appendChild(desc);
        wrapper.appendChild(textWrapper);

        featureListEl.appendChild(wrapper);
    });
}

function openModal() {
    console.log("openModal appelé");
    if (modalOverlay) {
        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
        renderFeatureList();
    } else {
        console.error("modalOverlay non trouvé!");
    }
}

function closeModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function saveFavoritesFromModal() {
    if (!featureListEl) {
        return;
    }

    const selected = Array.from(featureListEl.querySelectorAll('input[name="feature"]:checked')).map(
        (input) => input.value
    );

    favorites = selected;
    saveFavorites();
    renderFavorites();
    closeModal();
}

function removeFavorite(id) {
    favorites = favorites.filter((fav) => fav !== id);
    saveFavorites();
    renderFavorites();
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    console.log("=== FAVORIS: DOM chargé ===");
    
    // Initialize DOM references
    favContainer = document.getElementById("favCards");
    modalOverlay = document.getElementById("modalOverlay");
    featureListEl = document.getElementById("featureList");
    const customizeBtn = document.getElementById("customizeBtn");
    const closeBtn = document.querySelector(".close-btn");
    const cancelBtn = document.querySelector(".btn.secondary");
    const saveBtn = document.getElementById("saveBtn");
    
    console.log("Elements trouvés:");
    console.log("- favContainer:", favContainer);
    console.log("- modalOverlay:", modalOverlay);
    console.log("- featureListEl:", featureListEl);
    console.log("- customizeBtn:", customizeBtn);
    
    // Add event listeners
    if (customizeBtn) {
        console.log("Event listener ajouté au bouton personnaliser");
        customizeBtn.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("Bouton personnaliser cliqué!");
            openModal();
        });
    } else {
        console.error("ERREUR: bouton customizeBtn non trouvé!");
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeModal);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener("click", saveFavoritesFromModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    // Load and render favorites
    favorites = loadFavorites();
    console.log("Favoris chargés:", favorites);
    renderFavorites();
    
    console.log("=== FAVORIS: Initialisation terminée ===");
});
