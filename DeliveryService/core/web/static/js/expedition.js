document.addEventListener("DOMContentLoaded", function () {

    const openBtn = document.getElementById("AddExpeditionButton");
    const modal = document.getElementById("AddExpeditionModal"); // Fixed: Capital M
    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addExpeditionForm");

    // -----------------------
    // Open & Close Modal
    // -----------------------
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

        // Collect form data as JSON
        const data = {
            client: document.getElementById("client").value,
            destination: document.getElementById("destination").value,
            service: document.getElementById("service").value,
            poid: parseFloat(document.getElementById("poid").value),
            volume: parseFloat(document.getElementById("volume").value),
            montant: parseFloat(document.getElementById("montant").value),
            status: document.getElementById("status").value
        };

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
                const message = errorData.detail || "Failed to create expedition";
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