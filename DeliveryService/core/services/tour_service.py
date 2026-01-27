import datetime
from django.db.models import Sum, Count
from django.db.models.functions import ExtractMonth
from django.db import transaction

from core.models.models import Tour, Shipment, Incident

def update_tour_statistics(tour):
    """
    Update tour statistics based on assigned shipments.
    Calculates: nb_exp, distance (estimated), carb (fuel), incd (incidents)
    """
    if tour is None:
        return
    
    # Count number of expeditions assigned to this tour
    shipments = Shipment.objects.filter(tour=tour)
    tour.nb_exp = shipments.count()
    
    # Count incidents related to shipments in this tour
    tour.incd = Incident.objects.filter(shipment__tour=tour).count()
    
    # Calculate estimated fuel consumption (0.15 L/km is a common estimate)
    if tour.distance > 0:
        tour.carb = round(tour.distance * 0.15, 2)
    else:
        tour.carb = 0
    
    tour.save(update_fields=['nb_exp', 'carb', 'incd'])


class tour_service:
   

    def get_logistics_resource_analysis(self, year=None):
        if year is None:
            year = datetime.now().year

        # 1. Aggregate technical data from Tours
        resource_stats = Tour.objects.filter(tour_date__year=year).annotate(
            month=ExtractMonth('tour_date')
        ).values('month').annotate(
            total_km=Sum('distance'),
            total_duration=Sum('duration'),
            total_fuel=Sum('fuel_consumption'), # Assuming this field exists
            tech_incidents=Count('id', filter=Q(status='Technical Problem')),
            total_tours=Count('id')
        ).order_by('month')

        # 2. Format as a monthly journal
        journal = []
        for s in resource_stats:
            journal.append({
                'month': s['month'],
                'metrics': {
                    'distance_km': s['total_km'] or 0,
                    'duration_hrs': s['total_duration'] or 0,
                    'fuel_liters': s['total_fuel'] or 0,
                    'technical_issues': s['tech_incidents']
                },
                'efficiency': {
                    'avg_km_per_tour': round(s['total_km'] / s['total_tours'], 2) if s['total_tours'] > 0 else 0,
                    'fuel_efficiency': round(s['total_fuel'] / s['total_km'], 2) if s['total_km'] and s['total_km'] > 0 else 0
                }
            })
        
        return journal