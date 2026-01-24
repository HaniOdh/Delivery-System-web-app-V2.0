from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .permissions import IsAdmin
from core.services.client_service import add_price_to_sold
from core.services.payment_service import pay
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser


from core.models.models import (
    Client, Shipment, Driver, Vehicle,
    Destination, ServiceType, 
    Tour, Invoice, Payment, Incident, Complaint,Profile,IncidentImage
)

from .serializers import (
    ClientSerializer, DestinationSerializer, ServiceTypeSerializer,
     DriverSerializer, VehicleSerializer,
    TourSerializer, InvoiceSerializer, ShipmentSerializer,
    IncidentSerializer, ComplaintSerializer,PaymentSerializer,IncidentImageSerializer
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


@api_view(['GET'])
def get_invoices_by_param(request):
    client = request.GET.get("client")
    invoice_date = request.GET.get("invoice_date")
    status = request.GET.get("status")

    queryset = Shipment.objects.all()

    if client:
        queryset = queryset.filter(
            client__first_name__iexact=client
        )

    if invoice_date:
        queryset = queryset.filter(
            invoice_date=invoice_date
        )


    if status:
        queryset = queryset.filter(
            status__iexact=status
        )

    serializer = ShipmentSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_payments_by_param(request):
    client = request.GET.get("client")
    payment_date = request.GET.get("payment_date")
    status = request.GET.get("status")
    payment_method = request.GET.get("payment_method")
    invoice = request.GET.get("invoice")
   

    queryset = Shipment.objects.all()

    if client:
        queryset = queryset.filter(
            client__first_name__iexact=client
        )

    if payment_date:
        queryset = queryset.filter(
            payment_date=payment_date
        )

    if invoice:
        queryset = queryset.filter(
            invoice__iexact=invoice
        )

    if status:
        queryset = queryset.filter(
            status__iexact=status
        )
        
    if payment_method:
        queryset = queryset.filter(
            payment_method__iexact=payment_method
        )    

    serializer = ShipmentSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_expidition_by_param(request):
    client = request.GET.get("client")
    shipment_date = request.GET.get("shipment_date")
    destination = request.GET.get("destination")
    service = request.GET.get("service")
    status = request.GET.get("status")

    queryset = Shipment.objects.all()

    if client:
        queryset = queryset.filter(
            client__first_name__iexact=client
        )

    if shipment_date:
        queryset = queryset.filter(
            shipment_date=shipment_date
        )

    if destination:
        queryset = queryset.filter(
            destination__country__iexact=destination
        )

    if service:
        queryset = queryset.filter(
            service__label__iexact=service
        )

    if status:
        queryset = queryset.filter(
            status__iexact=status
        )

    serializer = ShipmentSerializer(queryset, many=True)
    return Response(serializer.data)



@api_view(['GET', 'PUT', 'DELETE'])
def handle_invoice(request, pk):
        try:
            obj = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            return Response(InvoiceSerializer(obj).data)

        if request.method == 'PUT':
            serializer = InvoiceSerializer(obj, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'DELETE':
            
            client = obj.client

        
        
            add_price_to_sold(client, -obj.amount_ttc)

        
            payments = obj.payment_set.all()  

            for payment in payments:
             add_price_to_sold(client, payment.amount)
             

            obj.delete()  

        
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_incident_image(request, incident_id):
    try:
        incident = Incident.objects.get(id=incident_id)
    except Incident.DoesNotExist:
        return Response({"error": "Incident not found"}, status=404)

    serializer = IncidentImageSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(incident=incident)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# ---------- BOUND VIEWS (THIS IS THE IMPORTANT PART) ----------

get_clients = list_create(Client, ClientSerializer)
client_detail = detail_view(Client, ClientSerializer)

get_destinations = list_create(Destination, DestinationSerializer)
destination_detail = detail_view(Destination, DestinationSerializer)

get_services = list_create(ServiceType, ServiceTypeSerializer)
service_detail = detail_view(ServiceType, ServiceTypeSerializer)


get_drivers = list_create(Driver, DriverSerializer)
driver_detail = detail_view(Driver, DriverSerializer)

get_vehicles = list_create(Vehicle, VehicleSerializer)
vehicle_detail = detail_view(Vehicle, VehicleSerializer)

get_tours = list_create(Tour, TourSerializer)
tour_detail = detail_view(Tour, TourSerializer)

get_invoices = list_create(Invoice, InvoiceSerializer)


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
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

from .permissions import IsAdmin

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])  
def create_agent(request):
    """
    POST /api/agents/
    Create a new agent user
    Admin only
    """
    # Get data
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    phone = request.data.get('phone', '')
    
    # Validate required fields
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not password:
        return Response(
            {'error': 'Password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'A user with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user with email as username
    try:
        user = User.objects.create_user(
            username=email,  # Use email as username
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=False,      # Agents shouldn't be staff
            is_superuser=False   # Agents shouldn't be superuser
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to create user: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create Profile with agent role
    try:
        Profile.objects.create(
            user=user,
            role='agent',
            phone=phone
        )
    except Exception as e:
        # Rollback user creation if profile fails
        user.delete()
        return Response(
            {'error': f'Failed to create profile: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Auto-create token for API (optional)
    try:
        from rest_framework.authtoken.models import Token
        token = Token.objects.create(user=user)
        token_key = token.key
    except:
        token_key = None
    
    return Response({
        'message': f'Agent {email} created successfully',
        'agent_id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': 'agent',
        'token': token_key  # Only include if admin should have agent's token
    }, status=status.HTTP_201_CREATED)



@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def agent_detail(request, pk):
    """
    GET /api/agents/<id>/ - Get agent details
    DELETE /api/agents/<id>/ - Delete an agent
    Admin only
    """
    try:
        # Get the user
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user has a profile
    try:
        profile = user.profile
    except Profile.DoesNotExist:
        return Response(
            {'error': 'User does not have a profile'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if the user is actually an agent
    if profile.role != 'agent':
        return Response(
            {'error': 'User is not an agent'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        # Create response data
        agent_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'date_joined': user.date_joined,
            'role': profile.role,
            'phone': profile.phone,
            'profile_created': profile.created_at
        }
        return Response(agent_data)
    
    elif request.method == 'DELETE':
        # Delete the agent
        email = user.email
        user.delete()
        return Response(
            {'message': f'Agent {email} deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )