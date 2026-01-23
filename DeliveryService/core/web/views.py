from django.apps import apps
from django.contrib.auth import logout as auth_logout
from django.core.paginator import Paginator
from django.db import connection
from django.http import Http404, HttpResponse
from django.shortcuts import redirect, render
from django.template import TemplateDoesNotExist




def home(request):
	return render(request, "home.html")


def login_view(request):
	return render(request, "auth/login.html")


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

	clients = Client.objects.all().order_by("id")
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

	drivers = Driver.objects.all().order_by("id")
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

	destinations = Destination.objects.all().order_by("id")
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

	vehicles = Vehicle.objects.all().order_by("id")
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

	pricing= pricing.objects.all().order_by("id")
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

	service_types = ServiceType.objects.all().order_by("id")
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

	incidents = Incident.objects.all().order_by("id")
	page_obj = Paginator(incidents, 10).get_page(request.GET.get("page"))
	return render(request, "incident/incident.html", {"page_obj": page_obj})

def statistics_view(request):
	
	return render(request, "incident/statistics.html")
def expedition_view(request):
	try:
		Shipment= apps.get_model("core", "Shipment")
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

	Shipments = Shipment.objects.all().order_by("id")
	page_obj = Paginator(Shipments, 10).get_page(request.GET.get("page"))
	return render(request, "expedition/expedition.html", {"page_obj": page_obj})

def suivi_view(request):
	"""
	Suivi expédition:
	- /suivi/?id=123  => détail Shipment id=123
	- /suivi/?q=ABC   => recherche (id ou champs texte si existants)
	"""
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
	q = (request.GET.get("q") or "").strip()

	shipment = None
	qs = Shipment.objects.all().order_by("-id")

	# Détail par id
	if shipment_id:
		try:
			shipment = qs.get(id=int(shipment_id))
		except (ValueError, Shipment.DoesNotExist):
			raise Http404("Shipment not found.")

	# Recherche simple (fallback: id uniquement, sinon champs optionnels si présents)
	elif q:
		if q.isdigit():
			qs = qs.filter(id=int(q))
		else:
			# on tente quelques champs courants si ils existent dans le modèle
			fields = {f.name for f in Shipment._meta.get_fields() if getattr(f, "concrete", False)}
			filters = {}
			for name in ("tracking_code", "reference", "status"):
				if name in fields:
					filters[f"{name}__icontains"] = q
			if filters:
				from django.db.models import Q
				cond = Q()
				for k, v in filters.items():
					cond |= Q(**{k: v})
				qs = qs.filter(cond)
			else:
				qs = qs.none()

	page_obj = Paginator(qs, 10).get_page(request.GET.get("page"))
	ctx = {"shipment": shipment, "page_obj": page_obj, "q": q}

	# Template dédié si dispo, sinon fallback vers la liste existante
	try:
		return render(request, "expedition/suivi.html", ctx)
	except TemplateDoesNotExist:
		return render(request, "expedition/expedition.html", ctx)

def tournee_view(request):
	try:
		Tour= apps.get_model("core", "Tour")
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

	Tournees = Tour.objects.all().order_by("id")
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

	Complaints = Complaint.objects.all().order_by("id")
	page_obj = Paginator(Complaints, 10).get_page(request.GET.get("page"))
	return render(request, "reclamation/reclamation.html", {"page_obj": page_obj})