document.addEventListener('DOMContentLoaded', function () {
    const checkboxes = document.querySelectorAll('.expedition-checkbox');
    const rows = document.querySelectorAll('.expedition-row');

    // Gestion du modal historique
    const historiqueBtn = document.querySelector('.history-btn');
    const modal = document.getElementById('historiqueModal');
    const closeBtn = document.getElementById('closeModal');

    // Gestion des checkboxes (votre code existant)
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            checkboxes.forEach(cb => {
                if (cb !== this) cb.checked = false;
            });
        });
    });

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