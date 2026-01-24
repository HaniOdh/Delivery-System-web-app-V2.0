import datetime
from django.db.models import Sum, Count
from django.db.models.functions import ExtractMonth
from sympy import Q

from DeliveryService.core.models.models import Tour

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