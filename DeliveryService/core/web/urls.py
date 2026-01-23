from django.urls import path

from . import views


urlpatterns = [
    path("", views.home, name="home"),

    path("login/", views.login_view, name="login"),
    path("signup/", views.signup_view, name="signup"),
    path("logout/", views.logout_view, name="logout"),

    # Compat: plusieurs noms possibles dans templates/anciens urls
    path("reset-password/", views.password_reset_view, name="reset_password"),
    path("password-reset/", views.password_reset_view, name="password_reset"),

    path("table/", views.list_clients, name="table"),
    path("table/clients/", views.list_clients, name="client_list"),
    path("table/drivers/", views.list_drivers, name="driver_list"),
    path("table/destinations/", views.list_destinations, name="destination_list"),
    path("table/vehicles/", views.list_vehicles, name="vehicle_list"),
    path("table/tarification/", views.list_tarifications, name="tarification_list"),
    path("table/services-types/", views.list_service_types, name="service_type_list"),
    path("favoris/", views.list_favorites, name="favorite_list"),
    path("incident/", views.list_incidents, name="incident_list"),
    path("incident/statistics/", views.statistics_view, name="incident_statistics"),
    path("expedition/", views.expedition_view, name="expedition_list"),
    path("expedition/suivi/", views.suivi_view, name="suivi_view"),
]
