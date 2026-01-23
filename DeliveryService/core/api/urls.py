from django.urls import path
from .views import (
    get_clients, client_detail,
    get_destinations, destination_detail,
    get_services, service_detail,
    get_drivers, driver_detail,
    get_vehicles, vehicle_detail,
    get_tours, tour_detail,
    get_invoices, handle_invoice,
    get_shipments, shipment_detail,
    get_payments, payment_detail,
    get_incidents, incident_detail,
    get_complaints, complaint_detail,
    get_expidition_by_param,
)

urlpatterns = [
    path('clients/', get_clients),
    path('clients/<int:pk>/', client_detail),

    path('destinations/', get_destinations),
    path('destinations/<int:pk>/', destination_detail),

    path('services/', get_services),
    path('services/<int:pk>/', service_detail),


    path('drivers/', get_drivers),
    path('drivers/<int:pk>/', driver_detail),

    path('vehicles/', get_vehicles),
    path('vehicles/<int:pk>/', vehicle_detail),

    path('tours/', get_tours),
    path('tours/<int:pk>/', tour_detail),

    path('invoices/', get_invoices),
    path('invoices/<int:pk>/', handle_invoice),

    path('shipments/', get_shipments),
    path('shipments/<int:pk>/', shipment_detail),
    path('shipments/filter/', get_expidition_by_param),

    path('payments/', get_payments),
    path('payments/<int:pk>/', payment_detail),

    path('incidents/', get_incidents),
    path('incidents/<int:pk>/', incident_detail),

    path('complaints/', get_complaints),
    path('complaints/<int:pk>/', complaint_detail),
]

