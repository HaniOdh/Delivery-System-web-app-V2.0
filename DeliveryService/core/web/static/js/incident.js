document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("AddIncidentButton");
    const modal = document.getElementById("addIncidentModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addIncidentForm");
    const photoInput = document.getElementById("photo");
    const previewBox = document.getElementById("photoPreview");

    if (!openBtn || !modal || !closeBtn || !form) {
        return;
    }

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

    // Live preview for photo selection
    if (photoInput && previewBox) {
        photoInput.addEventListener("change", () => {
            // reset preview
            previewBox.innerHTML = "";
            const file = photoInput.files && photoInput.files[0];
            if (!file) {
                const ph = document.createElement("div");
                ph.className = "img-placeholder";
                ph.textContent = "Aucune image sélectionnée";
                previewBox.appendChild(ph);
                return;
            }
            const img = document.createElement("img");
            img.alt = "Aperçu de la photo";
            img.src = URL.createObjectURL(file);
            img.onload = () => URL.revokeObjectURL(img.src);
            previewBox.appendChild(img);
        });
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("incident_type", form.incident_type.value.trim());
        formData.append("description", form.description.value.trim());
        formData.append("incident_date", form.incident_date.value);
        formData.append("piece_count", form.piece_count.value ? parseInt(form.piece_count.value, 10) : 0);
        formData.append("status", form.status.value);

        if (form.shipment.value) {
            formData.append("shipment", parseInt(form.shipment.value, 10));
        }
        if (form.tour.value) {
            formData.append("tour", parseInt(form.tour.value, 10));
        }

        const photoFile = form.photo.files && form.photo.files[0];
        if (photoFile) {
            formData.append("photo", photoFile);
        }

        fetch("/api/incidents/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
            },
            body: formData,
        })
            .then(async (response) => {
                console.log("Response status:", response.status);
                console.log("Response ok:", response.ok);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.log("Error data:", errorData);
                    
                    const message =
                        errorData.detail ||
                        errorData.error ||
                        Object.keys(errorData).length > 0 ? JSON.stringify(errorData) : null ||
                        `Erreur HTTP ${response.status}: ${response.statusText}`;
                    throw new Error(message);
                }
                return response.json();
            })
            .then(() => {
                alert("Incident créé avec succès!");
                window.location.reload();
            })
            .catch((error) => {
                alert("Erreur lors de la création de l'incident: " + error.message);
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
function updateIncidentStatus(selectElement) {
    const incidentId = selectElement.getAttribute("data-incident-id");
    const newStatus = selectElement.value;
    const originalStatus = selectElement.getAttribute("data-original-status");

    console.log(`Updating incident ${incidentId} from ${originalStatus} to status: ${newStatus}`);
    if(!confirm(`changer le statut de l'incident INC-${incidentId} à "${newStatus}" ?`)) {
        selectElement.value =selectElement.getAttribute("data-original-status");
        return;
    }
    if(!selectElement.getAttribute("data-original-status")) {
        selectElement.value = originalStatus;
        return;
    }
    fetch(`/api/incidents/${incidentId}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ status: newStatus }),
        
    })
    .then(data => {
        console.log("Incident status updated successfully:", data);
        const card = selectElement.closest(".incident-card");
        const badge = card.querySelector(".badge");
        if (badge) {
            badge.classList.remove('new', 'ongoing', 'resolved');
            badge.classList.add(newStatus);
            if (newStatus === 'new') {
                badge.textContent = 'New';
            } else if (newStatus === 'ongoing') {
                badge.textContent = 'Ongoing';  
            }else if (newStatus === 'resolved') {
                badge.textContent = 'Resolved';  
            }
        }

        selectElement.setAttribute("data-original-status", newStatus);
        alert("Statut de l'incident mis à jour avec succès.");
    })
    .catch(error => {
        console.error("Error updating incident status:", error);
        alert("Erreur lors de la mise à jour du statut de l'incident.");
        const originalStatus = selectElement.getAttribute("data-original-status");
        if (originalStatus) {
            selectElement.value = originalStatus;
        }
    }
    )
}