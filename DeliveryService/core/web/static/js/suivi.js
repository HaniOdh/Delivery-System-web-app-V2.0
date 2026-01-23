document.addEventListener('DOMContentLoaded', function () {
    const checkboxes = document.querySelectorAll('.expedition-checkbox');
    const rows = document.querySelectorAll('.expedition-row');

    const emptyState = document.getElementById('emptyState');
    const detailsContent = document.getElementById('detailsContent');

    // AU DÉPART
    emptyState.style.display = "flex";
    detailsContent.style.display = "none";

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {

            checkboxes.forEach(cb => {
                if (cb !== this) cb.checked = false;
            });

            if (this.checked) {
                emptyState.style.display = "none";
                detailsContent.style.display = "block";

                // remettre l’onglet Détails par défaut
                switchTab('details');
            } else {
                emptyState.style.display = "flex";
                detailsContent.style.display = "none";
            }
        });
    });

    rows.forEach(row => {
        row.addEventListener('click', function (e) {
            if (e.target.type !== 'checkbox') {
                const checkbox = this.querySelector('.expedition-checkbox');
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    });
});

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    if (tabName === 'details') {
        document.querySelector('.tab:nth-child(1)').classList.add('active');
        document.getElementById('detailsTab').classList.add('active');
    } else {
        document.querySelector('.tab:nth-child(2)').classList.add('active');
        document.getElementById('historiqueTab').classList.add('active');
    }
}