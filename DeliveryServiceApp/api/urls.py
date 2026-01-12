from django.urls import path
from api.views import (
    get_vehicule, create_vehicule,vehicule_detail,
    get_chauffeur, create_chauffeur,chauffeur_detail,
    get_client, create_client,client_detail,expedition_detail,  
    get_expedition, create_expedition,expedition_detail,
    get_tournee, create_tournee,tournee_detail,
    get_incident, create_incident,incident_detail,
    get_facture, create_facture,facture_detail,
    get_paiement, create_paiement,paiement_detail,
    get_reclamation, create_reclamation,reclamation_detail,
    get_destination, create_destination,destination_detail,
    get_type_service, create_type_service,type_service_detail,
    get_utilisateur, create_utilisateur,utilisateur_detail,
    get_pricing, create_pricing,pricing_detail
)




urlpatterns = [
    #  Vehicule
    path('vehicule/', get_vehicule, name='jib taxiyat'),
    path('vehicule/create', create_vehicule, name='hat taxiyat'),
    path('vehicule/<int:pk>', vehicule_detail, name='vehicule-detail'),

    #  Chauffeur
    path('chauffeur/', get_chauffeur, name='get chauffeur'),
    path('chauffeur/create', create_chauffeur, name='create chauffeur'),
    path('chauffeur/<int:pk>/', chauffeur_detail, name='chauffeur-detail'),

    #  Client
    path('client/', get_client, name='get client'),
    path('client/create', create_client, name='create client'),
    path('client/<int:pk>', client_detail, name='client-detail'),

    #  Expedition
    path('expedition/', get_expedition, name='get expedition'),
    path('expedition/create', create_expedition, name='create expedition'),
    path('expedition/<int:pk>', expedition_detail, name='expedition-detail'),
    
    #  Tournee
    path('tournee/', get_tournee, name='get tournee'),
    path('tournee/create', create_tournee, name='create tournee'),
    path('tournee/<int:pk>', tournee_detail, name='tournee-detail'),

    #  Incident
    path('incident/', get_incident, name='get incident'),
    path('incident/create', create_incident, name='create incident'),
    path('incident/<int:pk>', incident_detail, name='incident-detail'),

    #  Facture
    path('facture/', get_facture, name='get facture'),
    path('facture/create', create_facture, name='create facture'),
    path('facture/<int:pk>', facture_detail, name='facture-detail'),

    #  Paiement
    path('paiement/', get_paiement, name='get paiement'),
    path('paiement/create', create_paiement, name='create paiement'),
    path('paiement/<int:pk>', paiement_detail, name='paiement-detail'),

    #  Reclamation
    path('reclamation/', get_reclamation, name='get reclamation'),
    path('reclamation/create', create_reclamation, name='create reclamation'),
    path('reclamation/<int:pk>', reclamation_detail, name='reclamation-detail'),

    #  Destination
    path('destination/', get_destination, name='get destination'),
    path('destination/create', create_destination, name='create destination'),
    path('destination/<int:pk>', destination_detail, name='destination-detail'),

    #  Type Service
    path('type-service/', get_type_service, name='get type service'),
    path('type-service/create', create_type_service, name='create type service'),
    path('type-service/<int:pk>', type_service_detail, name='type-service-detail'),

    #  Utilisateur
    path('utilisateur/', get_utilisateur, name='get utilisateur'),
    path('utilisateur/create', create_utilisateur, name='create utilisateur'),
    path('utilisateur/<int:pk>', utilisateur_detail, name='utilisateur-detail'),

    # Pricing
    path('pricing/', get_pricing, name='get pricing'),
    path('pricing/create', create_pricing, name='create pricing'),    
    path('pricing/<int:pk>', pricing_detail, name='pricing-detail'),
]