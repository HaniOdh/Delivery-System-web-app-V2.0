from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from core.models.models import Shipment, ShipmentHistory, Tour

# ====================================
# CACHE POUR STOCKER LES ANCIENS STATUTS
# ====================================
_shipment_old_status = {}
_tour_old_status = {}


# ====================================
# SIGNAL 1 : CRÉER L'HISTORIQUE POUR NOUVELLE EXPÉDITION
# ====================================
@receiver(post_save, sender=Shipment)
def create_shipment_history_on_creation(sender, instance, created, **kwargs):
    """
    Créer automatiquement un historique quand une expédition est créée
    """
    if created:
        ShipmentHistory.objects.create(
            shipment=instance,
            status='Expédition créée',
            location='Centre de tri Alger',
            message=f'Colis {instance.tracking_number} enregistré dans le système'
        )
        print(f"✅ [SIGNAL] Historique créé pour {instance.tracking_number}")


# ====================================
# SIGNAL 2 : STOCKER L'ANCIEN STATUT D'EXPÉDITION
# ====================================
@receiver(pre_save, sender=Shipment)
def store_old_shipment_status(sender, instance, **kwargs):
    """
    Stocker l'ancien statut avant la modification
    """
    if instance.pk:
        try:
            old = Shipment.objects.get(pk=instance.pk)
            _shipment_old_status[instance.pk] = old.status
        except Shipment.DoesNotExist:
            pass


# ====================================
# SIGNAL 3 : AJOUTER À L'HISTORIQUE SI STATUT CHANGE
# ====================================
@receiver(post_save, sender=Shipment)
def track_shipment_status_change(sender, instance, created, **kwargs):
    """
    Ajouter à l'historique quand le statut d'une expédition change
    """
    if not created and instance.pk in _shipment_old_status:
        old_status = _shipment_old_status[instance.pk]
        
        if old_status != instance.status:
            # Le statut a changé !
            status_info = get_shipment_status_info(instance)
            
            ShipmentHistory.objects.create(
                shipment=instance,
                status=status_info['status'],
                location=status_info['location'],
                driver=instance.tour.driver if instance.tour else None,
                message=status_info['message']
            )
            
            print(f"✅ [SIGNAL] Statut expédition changé: {old_status} → {instance.status}")
            del _shipment_old_status[instance.pk]


# ====================================
# SIGNAL 4 : STOCKER L'ANCIEN STATUT DE TOURNÉE
# ====================================
@receiver(pre_save, sender=Tour)
def store_old_tour_status(sender, instance, **kwargs):
    """
    Stocker l'ancien statut de la tournée avant modification
    """
    if instance.pk:
        try:
            old = Tour.objects.get(pk=instance.pk)
            _tour_old_status[instance.pk] = old.status
        except Tour.DoesNotExist:
            pass


# ====================================
# SIGNAL 5 : METTRE À JOUR TOUTES LES EXPÉDITIONS QUAND TOURNÉE CHANGE
# ====================================
@receiver(post_save, sender=Tour)
def update_shipments_on_tour_status_change(sender, instance, created, **kwargs):
    """
    🚨 SIGNAL PRINCIPAL 🚨
    Quand le statut d'une tournée change, mettre à jour toutes ses expéditions
    """
    if not created and instance.pk in _tour_old_status:
        old_status = _tour_old_status[instance.pk]
        
        if old_status != instance.status:
            print(f"\n{'='*60}")
            print(f"🚚 TOURNÉE {instance.id} - Changement de statut détecté")
            print(f"   Ancien: {old_status} → Nouveau: {instance.status}")
            print(f"{'='*60}")
            
            # Récupérer toutes les expéditions de cette tournée
            shipments = Shipment.objects.filter(tour=instance)
            print(f"📦 {shipments.count()} expédition(s) trouvée(s)")
            
            # Déterminer le nouveau statut des expéditions selon le statut de la tournée
            new_shipment_status = map_tour_status_to_shipment_status(instance.status)
            
            # Mettre à jour chaque expédition
            for shipment in shipments:
                old_shipment_status = shipment.status
                shipment.status = new_shipment_status
                shipment.save()  # Ceci déclenche automatiquement le signal de l'expédition
                
                print(f"  ✅ {shipment.tracking_number}: {old_shipment_status} → {new_shipment_status}")
            
            print(f"{'='*60}\n")
            del _tour_old_status[instance.pk]


# ====================================
# FONCTIONS UTILITAIRES
# ====================================

def map_tour_status_to_shipment_status(tour_status):
    """
    Mapper le statut de la tournée au statut des expéditions
    """
    mapping = {
        'disponible': 'disponible',      # Statut expédition "disponible"
        'en_mission': 'en_mission',      # Statut expédition "en_mission"
        'offline': 'offline',            # Statut expédition "offline"
    }
    # Correction : forcer la casse et supprimer les espaces
    return mapping.get(str(tour_status).lower().strip(), 'disponible')


def get_shipment_status_info(shipment):
    
    status_lower = shipment.status.lower().strip()

    if status_lower == 'disponible':
        return {
            'status': 'En_transit',
            'location': 'Centre de tri Alger',
            'message': f'Colis {shipment.tracking_number} recupere pour transport'
        }
    if status_lower == 'en_mission':
        return {
            'status': 'En cours de livraison',
            'location': 'En cours de livraison',
            'message': f'Colis {shipment.tracking_number} en cours de livraison'
        }
    if status_lower == 'offline':
        return {
            'status': 'Livré',
            'location': shipment.destination.city if shipment.destination else 'N/A',
            'message': f'Colis {shipment.tracking_number} livré avec succès'
        }
    if status_lower =='en_transit':
        return {
            'status': 'En transit',
            'location': 'Centre de tri Alger',
            'message': f'Colis {shipment.tracking_number} recupere pour transport'
        }

    if status_lower == 'en cours de livraison':
        return {
            'status': 'En cours de livraison',
            'location': 'En cours de livraison',
            'message': f'Colis {shipment.tracking_number} en cours de livraison'
        }
    if status_lower == 'livré':
        return {
            'status': 'Livré',
            'location': shipment.destination.city if shipment.destination else 'N/A',
            'message': f'Colis {shipment.tracking_number} livré avec succès'
        }
    #pr defaut
    return {
        'status': shipment.status,
        'location': shipment.destination.city if shipment.destination else 'N/A',
        'message': f'Statut du colis {shipment.tracking_number} mis à jour'
    }

