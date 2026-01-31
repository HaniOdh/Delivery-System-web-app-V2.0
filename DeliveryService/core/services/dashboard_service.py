from datetime import datetime
from django.db.models import Count, Q, Sum
from django.db.models.functions import ExtractYear, ExtractMonth
from core.models.models import Shipment, Tour, Client, Destination, Payment
from datetime import datetime
from django.db.models import Count
from django.db.models.functions import TruncDate
class DashboardService:
    #Commercial Analysis Services
    def identify_top_client_volume(self):
       
        top_client = Client.objects.annotate(
            shipment_count=Count('shipment')
        ).order_by('-shipment_count')

        if not top_client:
            return None

        return [{
            'id': client.id,
            'name': f"{client.first_name} {client.last_name}",
            'count': client.shipment_count
        } for client in top_client[:10]]
    










    def identify_top_client_value(self):
        top_client = Client.objects.annotate(
            total_value=Sum('payment__amount')
        ).order_by('-total_value')

        if not top_client:
            return None

        return [{
            'id': client.id,
            'name': f"{client.first_name} {client.last_name}",
            'total_value': client.total_value
        } for client in top_client[:10]]
    










    def top_requested_destinations(self):
       

        top_destinations = Destination.objects.values(
            'country', 'city'
        ).annotate(
            shipment_count=Count('shipment')
        ).filter().order_by('-shipment_count')

        if not top_destinations:
            return None

        return [{
            'country': destination['country'],
            'city': destination['city'],
            'count': destination['shipment_count']
        } for destination in top_destinations[:10]]



#-----------------------------------------------------------------------








    def get_full_year_commercial_analysis(self, year=None):
        if year is None:
            year = datetime.now().year

       
        shipment_stats = Shipment.objects.filter(shipment_date__year=year) \
            .annotate(month=ExtractMonth('shipment_date')) \
            .values('month') \
            .annotate(count=Count('id')) \
            .order_by('month')

        # 2. Get Monthly Revenue (Payments)
        revenue_stats = Payment.objects.filter(payment_date__year=year) \
            .annotate(month=ExtractMonth('payment_date')) \
            .values('month') \
            .annotate(total=Sum('amount')) \
            .order_by('month')

        # 3. Combine and calculate Evolution Rates
        # We create a dictionary for all 12 months to ensure no month is missing
        report = {m: {'month': m, 'volume': 0, 'revenue': 0} for m in range(1, 13)}

        for s in shipment_stats:
            report[s['month']]['volume'] = s['count']
        for r in revenue_stats:
            report[r['month']]['revenue'] = float(r['total'] or 0)

        final_data = []
        for m in range(1, 13):
            curr = report[m]
            vol_evo = 0
            rev_evo = 0

            if m > 1: # Compare to the previous month in the dictionary
                prev = report[m-1]
                
                if prev['volume'] > 0:
                    vol_evo = ((curr['volume'] - prev['volume']) / prev['volume']) * 100

                if prev['revenue'] > 0:
                    rev_evo = ((curr['revenue'] - prev['revenue']) / prev['revenue']) * 100

            final_data.append({
                'month_index': m,
                'volume': curr['volume'],
                'volume_evolution': round(vol_evo, 2),
                'revenue': curr['revenue'],
                'revenue_evolution': round(rev_evo, 2)
            })

        return final_data
   
#-----------------------------------------------------------------------

    #////////////////////////////////////////////////////////////////////////
     #////////////////////////////////////////////////////////////////////////
      #////////////////////////////////////////////////////////////////////////
       #////////////////////////////////////////////////////////////////////////


    #Operational Analysis Services

    def get_tour_operational_analysis(self, year=None):
        if year is None:
            year = datetime.now().year

        # 1. Count TournÃ©es (Trips) per month
        tour_stats = Tour.objects.filter(tour_date__isnull=False, tour_date__year=year) \
            .annotate(month=ExtractMonth('tour_date')) \
            .values('month') \
            .annotate(total_tours=Count('id')) \
            .order_by('month')

        # 2. Initialize 12-month report
        report = {m: {'month': m, 'tours': 0} for m in range(1, 13)}
        for t in tour_stats:
            report[t['month']]['tours'] = t['total_tours']

        # 3. Calculate Evolution Rate
        final_ops_data = []
        for m in range(1, 13):
            curr = report[m]
            tour_evo = 0

            if m > 1:
                prev = report[m-1]
                if prev['tours'] > 0:
                    tour_evo = ((curr['tours'] - prev['tours']) / prev['tours']) * 100

            final_ops_data.append({
                'month': m,
                'total_tours': curr['tours'],
                'tour_evolution_rate': round(tour_evo, 2)
            })

        return final_ops_data









#    -----------------------------------------------------------------------

    def get_geographic_incident_analysis(self, year=None):
        if year is None:
            year = datetime.now().year

        # 1. Query for incidents (Failed or Delayed) grouped by month and zone
        # Accessing zone through destination relationship
        incident_stats = Shipment.objects.filter(
            shipment_date__isnull=False,
            shipment_date__year=year
        ).filter(
            Q(status='Failed') | Q(status='Delayed') # Only look for problems
        ).annotate(
            month=ExtractMonth('shipment_date')
        ).values('month', 'destination__zone').annotate(
            incident_count=Count('id')
        ).order_by('month', '-incident_count')

        # 2. Structure the data for the Dashboard
        # { month_index: [ {zone: 'Algiers', incidents: 5}, {zone: 'Oran', incidents: 2} ] }
        report = {m: [] for m in range(1, 13)}
        
        for entry in incident_stats:
            report[entry['month']].append({
                'zone': entry['destination__zone'],
                'incidents': entry['incident_count']
            })

        return report

    # ------------------------------------------------------------------------





    def get_tour_success_operational_analysis(self, year=None):
        if year is None:
            year = datetime.now().year

        # 1. Group by Month AND Zone
        # We calculate the total, success, failure, and delay for every zone every month
        raw_stats = Shipment.objects.filter(shipment_date__isnull=False, shipment_date__year=year).annotate(
            month=ExtractMonth('shipment_date')
        ).values('month', 'destination__zone').annotate(
            total_count=Count('id'),
            success_count=Count('id', filter=Q(status='Delivered')),
            failed_count=Count('id', filter=Q(status='Failed')),
            delayed_count=Count('id', filter=Q(status='Delayed'))
        ).order_by('month', 'destination__zone')

        # 2. Structure the data and apply your formulas
        monthly_report = {m: [] for m in range(1, 13)}

        for entry in raw_stats:
            total = entry['total_count']
            if total > 0:
                zone_data = {
                    'zone_name': entry['destination__zone'],
                    'total_deliveries': total,
                    'success_rate': round((entry['success_count'] / total) * 100, 2),
                    'failure_rate': round((entry['failed_count'] / total) * 100, 2),
                    'delay_rate': round((entry['delayed_count'] / total) * 100, 2),
                    'incident_total': entry['failed_count'] + entry['delayed_count']
                }
                monthly_report[entry['month']].append(zone_data)

        return monthly_report
    

    #-----------------------------------------------------------------------

    def get_top_drivers_analysis(self, year=None):
        if year is None:
            year = datetime.now().year

        # 1. Aggregate shipment data by Driver
        # We assume Shipment has a link to Tour, and Tour has driver FK
        driver_stats = Shipment.objects.filter(
            tour__tour_date__isnull=False,
            tour__tour_date__year=year
        ).values(
            'tour__driver_id', 
            'tour__driver__first_name',
            'tour__driver__last_name'
        ).annotate(
            total_deliveries=Count('id'),
            success_count=Count('id', filter=Q(status='Delivered')),
            delay_count=Count('id', filter=Q(status='Delayed')),
            # We also count unique tours to measure efficiency
            total_tours=Count('tour', distinct=True) 
        ).order_by('-success_count')

        # 2. Calculate individual KPIs
        top_drivers = []
        for d in driver_stats:
            total = d['total_deliveries']
            if total > 0:
                success_rate = (d['success_count'] / total) * 100
                delay_rate = (d['delay_count'] / total) * 100
                
               
                efficiency = d['success_count'] / d['total_tours'] if d['total_tours'] > 0 else 0

                top_drivers.append({
                    'driver_id': d['tour__driver_id'],
                    'name': f"{d['tour__driver__first_name']} {d['tour__driver__last_name']}",
                    'success_rate': round(success_rate, 2),
                    'punctuality_rate': round(100 - delay_rate, 2),
                    'efficiency_score': round(efficiency, 2),
                    'total_tours': d['total_tours']
                })

        # Sort by success rate to get the "Top" drivers
        return sorted(top_drivers, key=lambda x: x['success_rate'], reverse=True)[:5]
    

    #----------------------

    def get_peak_periods_logic(self, year=None):
        if year is None:
            year = datetime.now().year

        # Fetch all shipment dates for the year
        shipment_dates = Shipment.objects.filter(
            shipment_date__isnull=False,
            shipment_date__year=year
        ).values_list('shipment_date', flat=True)

        if not shipment_dates:
            return {"average_threshold": 0, "periods": []}

        # Count shipments per day in Python
        from collections import defaultdict
        daily_counts = defaultdict(int)
        for dt in shipment_dates:
            day_date = dt.date() if hasattr(dt, "date") else dt
            daily_counts[day_date] += 1

        daily_list = [{"date": k, "count": v} for k, v in sorted(daily_counts.items())]

        total_shipments = sum(d['count'] for d in daily_list)
        avg_daily_volume = total_shipments / len(daily_list)

        high_activity_periods = []
        current_period = None

        for day in daily_list:
            if day['count'] > avg_daily_volume:
                if current_period is None:
                    current_period = {"start": day['date'], "end": day['date'], "days_count": 1}
                else:
                    current_period["end"] = day['date']
                    current_period["days_count"] += 1
            else:
                if current_period:
                    high_activity_periods.append(current_period)
                    current_period = None

        if current_period:
            high_activity_periods.append(current_period)

        # Convert date objects to strings for JSON serialization
        for period in high_activity_periods:
            period['start'] = period['start'].strftime('%Y-%m-%d')
            period['end'] = period['end'].strftime('%Y-%m-%d')

        return {"average_threshold": round(avg_daily_volume, 2), "periods": high_activity_periods}
