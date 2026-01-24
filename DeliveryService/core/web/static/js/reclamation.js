document.addEventListener("DOMContentLoaded", function()  {
    const openBtn = document.getElementById("AddReclamationButton");
    const modal = document.getElementById("addReclamationModal");
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addReclamationForm");

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
