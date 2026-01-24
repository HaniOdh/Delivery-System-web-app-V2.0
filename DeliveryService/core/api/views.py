from huggingface_hub import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .permissions import IsAdmin

from core.models.models import (
    Client, Shipment, Driver, Vehicle,
    Destination, ServiceType, Pricing,
    Tour, Invoice, Payment, Incident, Complaint
)

from .serializers import (
    ClientSerializer, DestinationSerializer, ServiceTypeSerializer,
    PricingSerializer, DriverSerializer, VehicleSerializer,
    TourSerializer, InvoiceSerializer, ShipmentSerializer,
    PaymentSerializer, IncidentSerializer, ComplaintSerializer
)


# ---------- GENERIC VIEW FACTORIES ----------

def list_create(model, serializer_class):
    @api_view(['GET', 'POST'])
    def view(request):
        if request.method == 'GET':
            objs = model.objects.all()
            serializer = serializer_class(objs, many=True)
            return Response(serializer.data)

        if request.method == 'POST':
            serializer = serializer_class(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return view


def detail_view(model, serializer_class):
    @api_view(['GET', 'PUT', 'DELETE'])
    def view(request, pk):
        try:
            obj = model.objects.get(pk=pk)
        except model.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            return Response(serializer_class(obj).data)

        if request.method == 'PUT':
            serializer = serializer_class(obj, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'DELETE':
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    return view


# ---------- BOUND VIEWS (THIS IS THE IMPORTANT PART) ----------

get_clients = list_create(Client, ClientSerializer)
client_detail = detail_view(Client, ClientSerializer)

get_destinations = list_create(Destination, DestinationSerializer)
destination_detail = detail_view(Destination, DestinationSerializer)

get_services = list_create(ServiceType, ServiceTypeSerializer)
service_detail = detail_view(ServiceType, ServiceTypeSerializer)

get_pricings = list_create(Pricing, PricingSerializer)
pricing_detail = detail_view(Pricing, PricingSerializer)

get_drivers = list_create(Driver, DriverSerializer)
driver_detail = detail_view(Driver, DriverSerializer)

get_vehicles = list_create(Vehicle, VehicleSerializer)
vehicle_detail = detail_view(Vehicle, VehicleSerializer)

get_tours = list_create(Tour, TourSerializer)
tour_detail = detail_view(Tour, TourSerializer)

get_invoices = list_create(Invoice, InvoiceSerializer)
invoice_detail = detail_view(Invoice, InvoiceSerializer)

get_shipments = list_create(Shipment, ShipmentSerializer)
shipment_detail = detail_view(Shipment, ShipmentSerializer)

get_payments = list_create(Payment, PaymentSerializer)
payment_detail = detail_view(Payment, PaymentSerializer)

get_incidents = list_create(Incident, IncidentSerializer)
incident_detail = detail_view(Incident, IncidentSerializer)

get_complaints = list_create(Complaint, ComplaintSerializer)
complaint_detail = detail_view(Complaint, ComplaintSerializer)

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])  
def create_agent(request):
    """Admin creates new agent via API"""
    email = request.data['email']
    password = request.data['password']
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    # Create user with email as username
    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role='agent'  # Set as agent
    )
    
    # Auto-create token for API (if using DRF tokens)
    from rest_framework.authtoken.models import Token
    token = Token.objects.create(user=user)
    
    return Response({
        'message': f'Agent {email} created',
        'token': token.key,
        'email': email
    })
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect

# views.py
def login_view(request):
    print("=" * 50)
    print("LOGIN VIEW WAS CALLED!")
    print(f"Request method: {request.method}")
    
    if request.method == 'POST':
        print("✓ POST RECEIVED!")
        print(f"Email field: {request.POST.get('email', 'NOT FOUND')}")
        print(f"Password field: {'FOUND' if 'password' in request.POST else 'NOT FOUND'}")
    else:
        print("✗ GET request (page loaded)")
    
    print("=" * 50)
    
    # ... rest of your login code ...
    return render(request, 'login.html')