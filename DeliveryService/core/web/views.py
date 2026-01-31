from django.apps import apps
from django.contrib.auth import logout as auth_logout
from django.core.paginator import Paginator
from django.db import connection
from django.http import Http404, HttpResponse
from django.shortcuts import redirect, render
from django.template import TemplateDoesNotExist
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as django_login
from django.db.models import Q  # Ajouté pour la recherche avancée

from core.models.models import *




def home(request):
	return render(request, "home.html")


# core/web/views.py
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib.auth.models import User

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        print("=" * 50)
        print("LOGIN ATTEMPT:")
        print(f"Email entered: {email}")
        print(f"Password entered: {'YES' if password else 'NO'}")
        
        # DEBUG: List all users
        print("\nALL USERS IN DATABASE:")
        for user in User.objects.all():
            print(f"  - {user.username} | {user.email} | Superuser: {user.is_superuser}")
        
        # Try authentication
        user = authenticate(request, username=email, password=password)
        
        if user:
            print(f"✓ AUTH SUCCESS! User: {user.username}")
            django_login(request, user)
            return redirect('home')
        else:
            print("✗ AUTH FAILED")
            return render(request, 'auth/login.html', {'error': 'Invalid email or password'})
    
    return render(request, 'auth/login.html')


def signup_view(request):
	return render(request, "auth/signup.html")


def logout_view(request):
	auth_logout(request)
	return redirect("login")


def password_reset_view(request):
	return render(request, "auth/reset_pass.html")


# Aliases pour compat avec d'anciens noms utilisés dans urls.py/templates
login = login_view
signup = signup_view
logout = logout_view
reset_password = password_reset_view
password_reset = password_reset_view


def list_clients(request):
	try:
		Client = apps.get_model("core", "Client")
	except LookupError as e:
		raise Http404("Client model not found (check core/models/models.py).") from e

	db_table = Client._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"table/client/client.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)

	search_query = request.GET.get('search', '').strip()
	clients = Client.objects.all()
	if search_query:
		clients = clients.filter(
			Q(first_name__icontains=search_query) | Q(last_name__icontains=search_query)
		)

	page_obj = Paginator(clients, 10).get_page(request.GET.get("page"))
	return render(request, "table/client/client.html", {"page_obj": page_obj})


def list_drivers(request):
	try:
		Driver = apps.get_model("core", "Driver")
	except LookupError as e:
		raise Http404("Driver model not found (check core/models/models.py).") from e

	db_table = Driver._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"table/driver/driver.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)

	search_query = request.GET.get('search', '').strip()
	drivers = Driver.objects.all()
	if search_query:
		drivers = drivers.filter(
			Q(first_name__icontains=search_query) | Q(last_name__icontains=search_query)
		)
	page_obj = Paginator(drivers, 10).get_page(request.GET.get("page"))
	return render(request, "table/driver/driver.html", {"page_obj": page_obj})
def list_destinations(request):
	try:
		Destination = apps.get_model("core", "Destination")
	except LookupError as e:
		raise Http404("Destination model not found (check core/models/models.py).") from e

	db_table = Destination._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"table/destinations/destinations.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)

	search_query = request.GET.get('search', '').strip()
	destinations = Destination.objects.all()
	if search_query:
		destinations = destinations.filter(
			Q(city__icontains=search_query) |
			Q(country__icontains=search_query) |
			Q(zone__icontains=search_query)
		)

	destinations = destinations.order_by("id")
	page_obj = Paginator(destinations, 10).get_page(request.GET.get("page"))
	return render(request, "table/destinations/destinations.html", {"page_obj": page_obj})


def list_vehicles(request):
	try:
		Vehicle = apps.get_model("core", "Vehicle")
	except LookupError as e:
		raise Http404("Vehicle model not found (check core/models/models.py).") from e

	db_table = Vehicle._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"table/vehicle/vehicle.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)
	search_query = request.GET.get('search', '').strip()
	vehicles = Vehicle.objects.all()
	if search_query:
		vehicles = vehicles.filter(
			Q(plate_number__icontains=search_query) |
			Q(model__icontains=search_query) |
			Q(brand__icontains=search_query) |
			Q(status__icontains=search_query)
		)
	page_obj = Paginator(vehicles, 10).get_page(request.GET.get("page"))
	return render(request, "table/vehicule/vehicule.html", {"page_obj": page_obj})

def list_tarifications(request):
	try:
		pricing= apps.get_model("core", "pricing")
	except LookupError as e:
		raise Http404("Tarification model not found (check core/models/models.py).") from e

	db_table = pricing._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"table/tarification/tarification.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)
	search_query = request.GET.get('search', '').strip()
	pricing= pricing.objects.all()
	if search_query:
		pricing = pricing.filter(
			Q(zone__icontains=search_query) |
			Q(weight_range__icontains=search_query) |
			Q(price__icontains=search_query)
		)
	page_obj = Paginator(pricing, 10).get_page(request.GET.get("page"))
	return render(request, "table/tarification/tarifications.html", {"page_obj": page_obj})

def list_service_types(request):
	try:
		ServiceType = apps.get_model("core", "ServiceType")
	except LookupError as e:
		raise Http404("ServiceType model not found (check core/models/models.py).") from e

	db_table = ServiceType._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"table/service_type/service_type.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)
	search_query = request.GET.get('search', '').strip()
	service_types = ServiceType.objects.all()
	if search_query:
		service_types = service_types.filter(
			Q(label__icontains=search_query)
		)
	page_obj = Paginator(service_types, 10).get_page(request.GET.get("page"))
	return render(request, "table/service-type/servicestype.html", {"page_obj": page_obj})

def list_favorites(request):
	return render(request, "favoris/favoris.html")

def list_incidents(request):
	try:
		Incident = apps.get_model("core", "Incident")
	except LookupError as e:
		raise Http404("Incident model not found (check core/models/models.py).") from e

	db_table = Incident._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"incident/incident.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)

	search_query = request.GET.get('search', '').strip()
	incidents = Incident.objects.all()
	if search_query:
		incidents = incidents.filter(
			Q(description__icontains=search_query) |
			Q(status__icontains=search_query)
		)
	page_obj = Paginator(incidents, 10).get_page(request.GET.get("page"))
	return render(request, "incident/incident.html", {"page_obj": page_obj})

def statistics_view(request):
	
	return render(request, "incident/statistics.html")
def expedition_view(request):
    try:
        Shipment = apps.get_model("core", "Shipment")
    except LookupError as e:
        raise Http404("Shipment model not found (check core/models/models.py).") from e
    db_table = Shipment._meta.db_table
    if db_table not in connection.introspection.table_names():
        page_obj = Paginator([], 10).get_page(request.GET.get("page"))
        return render(
            request,
            "expedition/expedition.html",
            {
                "page_obj": page_obj,
                "db_warning": (
                    f"Missing DB table '{db_table}'. Run makemigrations + migrate."
                ),
            },
        )
    search_query = request.GET.get('search', '').strip()
    Shipments = Shipment.objects.all()
    if search_query:
        q_obj = (
            Q(tracking_number__icontains=search_query) |
            Q(status__icontains=search_query) |
            Q(client__first_name__icontains=search_query) |
            Q(client__last_name__icontains=search_query) 
        )
        if search_query.isdigit():
            q_obj |= Q(id=int(search_query))
        Shipments = Shipments.filter(q_obj)
    Shipments = Shipments.order_by('id')
    page_obj = Paginator(Shipments, 10).get_page(request.GET.get("page"))
    return render(request, "expedition/expedition.html", {"page_obj": page_obj})

def suivi_view(request):
	
	try:
		Shipment = apps.get_model("core", "Shipment")
	except LookupError as e:
		raise Http404("Shipment model not found (check core/models/models.py).") from e

	db_table = Shipment._meta.db_table
	if db_table not in connection.introspection.table_names():
		return render(
			request,
			"expedition/expedition.html",
			{
				"page_obj": Paginator([], 10).get_page(request.GET.get("page")),
				"db_warning": f"Missing DB table '{db_table}'. Run makemigrations + migrate.",
			},
		)
	
	shipment_id = request.GET.get("id")
	search_query = request.GET.get("search", "").strip()

	shipment = None
	qs = Shipment.objects.all().order_by("-id")

	# Détail par id
	if shipment_id:
		try:
			shipment = qs.get(id=int(shipment_id))
		except (ValueError, Shipment.DoesNotExist):
			raise Http404("Shipment not found.")

	# Recherche par tracking_number ou nom/prénom client
	elif search_query:
		q_obj = (
			Q(tracking_number__icontains=search_query) |
			Q(client__first_name__icontains=search_query) |
			Q(client__last_name__icontains=search_query)
		)
		if search_query.isdigit():
			q_obj |= Q(id=int(search_query))
		qs = qs.filter(q_obj)

	page_obj = Paginator(qs, 10).get_page(request.GET.get("page"))
	ctx = {"shipment": shipment, "page_obj": page_obj, "search_query": search_query}

	# Template dédié si dispo, sinon fallback vers la liste existante
	try:
		return render(request, "expedition/suivi.html", ctx)
	except TemplateDoesNotExist:
		return render(request, "expedition/expedition.html", ctx)

def tournee_view(request):
    try:
        Tour = apps.get_model("core", "Tour")
    except LookupError as e:
        raise Http404("Tournee model not found (check core/models/models.py).") from e
    db_table = Tour._meta.db_table
    if db_table not in connection.introspection.table_names():
        page_obj = Paginator([], 10).get_page(request.GET.get("page"))
        return render(
            request,
            "expedition/tourne.html",
            {
                "page_obj": page_obj,
                "db_warning": (
                    f"Missing DB table '{db_table}'. Run makemigrations + migrate."
                ),
            },
        )
    search_query = request.GET.get('search', '').strip()
    Tournees = Tour.objects.all()
    if search_query:
        q_obj = (
            Q(tour_date__icontains=search_query) |
            Q(status__icontains=search_query) |
            Q(driver__first_name__icontains=search_query) |
            Q(driver__last_name__icontains=search_query) |
            Q(vehicle__plate_number__icontains=search_query)
        )
        if search_query.isdigit():
            q_obj |= Q(id=int(search_query))
        Tournees = Tournees.filter(q_obj)
    Tournees = Tournees.order_by('-id')
    page_obj = Paginator(Tournees, 10).get_page(request.GET.get("page"))
    return render(request, "expedition/tourne.html", {"page_obj": page_obj})

def reclamation_view(request):
	try:
		Complaint= apps.get_model("core", "Complaint")
	except LookupError as e:
		raise Http404("Reclamation model not found (check core/models/models.py).") from e
	db_table = Complaint._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"reclamation/reclamation.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)
	search_query = request.GET.get('search', '').strip()
	Complaints = Complaint.objects.all()
	if search_query:
		Complaints = Complaints.filter(
			Q(description__icontains=search_query) |
			Q(status__icontains=search_query)
		)
	page_obj = Paginator(Complaints, 10).get_page(request.GET.get("page"))
	return render(request, "reclamation/reclamation.html", {"page_obj": page_obj})

def facturation_view(request):
	try:
		Invoice= apps.get_model("core", "Invoice")
	except LookupError as e:
		raise Http404("Facturation model not found (check core/models/models.py).") from e
	db_table = Invoice._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"facture/facture.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)
	search_query = request.GET.get('search', '').strip()
	Invoices = Invoice.objects.all()
	if search_query:
		Invoices = Invoices.filter(
			Q(client__first_name__icontains=search_query) |
			Q(client__last_name__icontains=search_query) |
			Q(status__icontains=search_query)
		)
	page_obj = Paginator(Invoices, 10).get_page(request.GET.get("page"))
	return render(request, "facture/facture.html", {"page_obj": page_obj})

def paiement_view(request):
	try:
		Payment= apps.get_model("core", "Payment")
	except LookupError as e:
		raise Http404("Paiement model not found (check core/models/models.py).") from e
	db_table = Payment._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"facture/paiements.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)
	search_query = request.GET.get('search', '').strip()
	Payments = Payment.objects.all()
	if search_query:
		q_obj = (
			Q(invoice__client__first_name__icontains=search_query) |
			Q(invoice__client__last_name__icontains=search_query) |
			Q(payment_method__icontains=search_query)
		)
		if search_query.isdigit():
			q_obj |= Q(id=int(search_query))
		Payments = Payments.filter(q_obj)
	page_obj = Paginator(Payments, 10).get_page(request.GET.get("page"))
	return render(request, "facture/paiements.html", {"page_obj": page_obj})

def list_agents(request):
	try:
		Profile = apps.get_model("core", "Profile")
	except LookupError as e:
		raise Http404("Agent model not found (check core/models/models.py).") from e

	db_table = Profile._meta.db_table
	if db_table not in connection.introspection.table_names():
		page_obj = Paginator([], 10).get_page(request.GET.get("page"))
		return render(
			request,
			"table/agent/agent.html",
			{
				"page_obj": page_obj,
				"db_warning": (
					f"Missing DB table '{db_table}'. Run makemigrations + migrate."
				),
			},
		)
	search_query = request.GET.get('search', '').strip()
	agents = Profile.objects.all()
	if search_query:
		agents = agents.filter(
			Q(user__first_name__icontains=search_query) |
			Q(user__last_name__icontains=search_query) |
			Q(role__icontains=search_query)
		)
	page_obj = Paginator(agents, 10).get_page(request.GET.get("page"))
	return render(request, "table/agent/agent.html", {"page_obj": page_obj})

def commercial_dashboard_view(request):
	"""
	Commercial Dashboard View
	Displays commercial analysis including:
	- Top clients by volume
	- Top clients by value
	- Top destinations
	- Monthly volume and revenue analysis
	"""
	from core.services.dashboard_service import DashboardService
	import json
	
	dashboard_service = DashboardService()
	
	# Get commercial analysis data
	top_clients_volume = dashboard_service.identify_top_client_volume()
	top_clients_value = dashboard_service.identify_top_client_value()
	top_destinations = dashboard_service.top_requested_destinations()
	monthly_analysis = dashboard_service.get_full_year_commercial_analysis()
	
	context = {
		'top_clients_volume': top_clients_volume or [],
		'top_clients_value': top_clients_value or [],
		'top_destinations': top_destinations or [],
		'monthly_analysis': json.dumps(monthly_analysis or []),
	}
	
	return render(request, 'dashboard/commercialDashboards.html', context)


def operational_dashboard_view(request):
	"""
	Operational Dashboard View
	Displays operational analysis including:
	- Tour operational metrics
	- Geographic incident analysis
	- Tour success rates by zone
	- Top drivers performance
	- Peak activity periods
	"""
	from core.services.dashboard_service import DashboardService
	import json
	
	dashboard_service = DashboardService()
	
	# Get operational analysis data
	tour_analysis = dashboard_service.get_tour_operational_analysis()
	incident_analysis = dashboard_service.get_geographic_incident_analysis()
	tour_success_analysis = dashboard_service.get_tour_success_operational_analysis()
	top_drivers = dashboard_service.get_top_drivers_analysis()
	peak_periods = dashboard_service.get_peak_periods_logic()
	
	context = {
		'tour_analysis': json.dumps(tour_analysis or []),
		'incident_analysis': json.dumps(incident_analysis or {}),
		'tour_success_analysis': json.dumps(tour_success_analysis or {}),
		'top_drivers': top_drivers or [],
		'peak_periods': json.dumps(peak_periods or {}),
	}
	
	return render(request, 'dashboard/operationalDashboards.html', context)