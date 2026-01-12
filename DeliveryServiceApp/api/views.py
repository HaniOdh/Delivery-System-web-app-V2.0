from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import (
    Vehicule, Chauffeur, Client, Expedition, Tournee,
    Incident, Facture, Paiement, Reclamation,
    Destination, TypeService, Utilisateur, Pricing
)
from .serializers import (
    VehiculeSerializer, ChauffeurSerializer, ClientSerializer,
    ExpeditionSerializer, TourneeSerializer, IncidentSerializer,
    FactureSerializer, PaiementSerializer, ReclamationSerializer,
    DestinationSerializer, TypeServiceSerializer, UtilisateurSerializer, PricingSerializer
)
# Create your views here.

# GET ALL CARS
@api_view(['GET'])
def get_vehicule(request):
    vehicule = Vehicule.objects.all()
    serializer = VehiculeSerializer(vehicule, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_vehicule(request):
    serializer = VehiculeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

@api_view(['GET', 'PUT', 'DELETE'])
def vehicule_detail(request, pk):
    try:
        obj = Vehicule.objects.get(pk=pk)
    except Vehicule.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = VehiculeSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = VehiculeSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL DRIVERS 
@api_view(['GET'])
def get_chauffeur(request):
    chauffeurs = Chauffeur.objects.all()
    serializer = ChauffeurSerializer(chauffeurs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_chauffeur(request):
    serializer = ChauffeurSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def chauffeur_detail(request, pk):
    try:
        obj = Chauffeur.objects.get(pk=pk)
    except Chauffeur.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ChauffeurSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ChauffeurSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL client
@api_view(['GET'])
def get_client(request):
    clients = Client.objects.all()
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_client(request):
    serializer = ClientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def client_detail(request, pk):
    try:
        obj = Client.objects.get(pk=pk)
    except Client.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ClientSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ClientSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL Expedition
@api_view(['GET'])
def get_expedition(request):
    expeditions = Expedition.objects.all()
    serializer = ExpeditionSerializer(expeditions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_expedition(request):
    serializer = ExpeditionSerializer(data=request.data)
    if serializer.is_valid():

        
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)



    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def expedition_detail(request, pk):
    try:
        obj = Expedition.objects.get(pk=pk)
    except Expedition.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ExpeditionSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ExpeditionSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL Tournee
@api_view(['GET'])
def get_tournee(request):
    tournees = Tournee.objects.all()
    serializer = TourneeSerializer(tournees, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_tournee(request):
    serializer = TourneeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def tournee_detail(request, pk):
    try:
        obj = Tournee.objects.get(pk=pk)
    except Tournee.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TourneeSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = TourneeSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL Incident
@api_view(['GET'])
def get_incident(request):
    incidents = Incident.objects.all()
    serializer = IncidentSerializer(incidents, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_incident(request):
    serializer = IncidentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def incident_detail(request, pk):
    try:
        obj = Incident.objects.get(pk=pk)
    except Incident.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = IncidentSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = IncidentSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL Facture
@api_view(['GET'])
def get_facture(request):
    factures = Facture.objects.all()
    serializer = FactureSerializer(factures, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_facture(request):
    serializer = FactureSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def facture_detail(request, pk):
    try:
        obj = Facture.objects.get(pk=pk)
    except Facture.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FactureSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = FactureSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL Paiement
@api_view(['GET'])
def get_paiement(request):
    paiements = Paiement.objects.all()
    serializer = PaiementSerializer(paiements, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_paiement(request):
    serializer = PaiementSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def paiement_detail(request, pk):
    try:
        obj = Paiement.objects.get(pk=pk)
    except Paiement.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PaiementSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = PaiementSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL Reclamation
@api_view(['GET'])
def get_reclamation(request):
    reclamations = Reclamation.objects.all()
    serializer = ReclamationSerializer(reclamations, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_reclamation(request):
    serializer = ReclamationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def reclamation_detail(request, pk):
    try:
        obj = Reclamation.objects.get(pk=pk)
    except Reclamation.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ReclamationSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ReclamationSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL destinations
@api_view(['GET'])
def get_destination(request):
    destinations = Destination.objects.all()
    serializer = DestinationSerializer(destinations, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_destination(request):
    serializer = DestinationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def destination_detail(request, pk):
    try:
        obj = Destination.objects.get(pk=pk)
    except Destination.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DestinationSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = DestinationSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL TypeService
@api_view(['GET'])
def get_type_service(request):
    services = TypeService.objects.all()
    serializer = TypeServiceSerializer(services, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_type_service(request):
    serializer = TypeServiceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def type_service_detail(request, pk):
    try:
        obj = TypeService.objects.get(pk=pk)
    except TypeService.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TypeServiceSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = TypeServiceSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL Utilisateur
@api_view(['GET'])
def get_utilisateur(request):
    utilisateurs = Utilisateur.objects.all()
    serializer = UtilisateurSerializer(utilisateurs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_utilisateur(request):
    serializer = UtilisateurSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def utilisateur_detail(request, pk):
    try:
        obj = Utilisateur.objects.get(pk=pk)
    except Utilisateur.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UtilisateurSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UtilisateurSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

##

#GET ALL Pricing
@api_view(['GET'])
def get_pricing(request):
    pricings = Pricing.objects.all()
    serializer = PricingSerializer(pricings, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_pricing(request):
    serializer = PricingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def pricing_detail(request, pk):
    try:
        obj = Pricing.objects.get(pk=pk)
    except Pricing.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PricingSerializer(obj)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = PricingSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

