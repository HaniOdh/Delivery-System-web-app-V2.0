from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


# Create your models here.


class Client(models.Model):
    solld = models.FloatField(default=0)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"



class Destination(models.Model):
    base_rate = models.FloatField()
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    zone = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.city}, {self.country}"


class ServiceType(models.Model):
    label = models.CharField(max_length=100)
    price_per_weight = models.FloatField()
    price_per_volume = models.FloatField()
    estimated_delay = models.CharField(max_length=50)

    def __str__(self):
        return self.label





class Driver(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    license_number = models.CharField(max_length=50, unique=True)
    hire_date = models.DateField()
    status = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Vehicle(models.Model):
    plate_number = models.CharField(max_length=50, unique=True)
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    max_weight = models.FloatField()
    max_volume = models.FloatField()
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.plate_number


class Tour(models.Model):
    tour_date = models.DateField()
    distance = models.FloatField()
    duration = models.FloatField()
    status = models.CharField(max_length=50)
    driver = models.ForeignKey(Driver, on_delete=models.RESTRICT)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.RESTRICT)
    
    # Computed/tracked fields
    nb_exp = models.IntegerField(default=0, verbose_name="Number of Expeditions")
    carb = models.FloatField(default=0, verbose_name="Fuel Consumption (L)")
    incd = models.IntegerField(default=0, verbose_name="Number of Incidents")

    def __str__(self):
        return f"Tour {self.id}"


class Invoice(models.Model):
    invoice_date = models.DateField()
    amount_ht = models.FloatField( default=0)
    amount_vat = models.FloatField(default=0.19)
    amount_ttc = models.FloatField( default=0)
    rest = models.FloatField(default=0)
    status = models.CharField(max_length=50)
    client = models.ForeignKey(Client, on_delete=models.RESTRICT)

    def __str__(self):
        return f"Invoice {self.id}"


class Shipment(models.Model):
    tracking_number = models.CharField(max_length=50, unique=True)
    shipment_date = models.DateField()
    weight = models.FloatField()
    volume = models.FloatField()
    description = models.TextField()
    amount_ht = models.FloatField( default=0)
    status = models.CharField(max_length=50)

    client = models.ForeignKey(Client, on_delete=models.RESTRICT)
    destination = models.ForeignKey(Destination, on_delete=models.RESTRICT)
    service = models.ForeignKey(ServiceType, on_delete=models.RESTRICT)
    tour = models.ForeignKey(Tour, on_delete=models.RESTRICT, null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.tracking_number


class Payment(models.Model):
    payment_date = models.DateField()
    amount = models.FloatField()
    payment_method = models.CharField(max_length=50)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.RESTRICT)

    def __str__(self):
        return f"Payment {self.id}"


class Incident(models.Model):
    incident_type = models.CharField(max_length=100)
    description = models.TextField()
    incident_date = models.DateTimeField()
    piece_count = models.PositiveIntegerField(default=0)
    photo = models.ImageField(upload_to="incidents/", null=True, blank=True)
    shipment = models.ForeignKey(Shipment, on_delete=models.RESTRICT)
    tour = models.ForeignKey(Tour, on_delete=models.RESTRICT)
    status = models.CharField(max_length=100,default='new')
    
    def __str__(self):
        return self.incident_type


class Complaint(models.Model):
    subject = models.CharField(max_length=100)
    description = models.TextField()
    complaint_date = models.DateTimeField()
    status = models.CharField(max_length=50)
    client = models.ForeignKey(Client, on_delete=models.RESTRICT)
    shipment = models.ForeignKey(Shipment, on_delete=models.RESTRICT)

    def __str__(self):
        return self.subject





# models.py
from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    """Extended user information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    role = models.CharField(
        max_length=10,
        choices=[
            ('admin', 'Administrator'),
            ('agent', 'Delivery Agent'),
        ],
        default='agent'
    )
    
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} ({self.role})"
    
    @property
    def is_admin(self):
        return self.role == 'admin'

class ShipmentHistory(models.Model):
    shipment=models.ForeignKey('Shipment', on_delete=models.CASCADE, related_name='history')
    status=models.CharField(max_length=100)
    location=models.CharField(max_length=255,blank=True,null=True)
    driver=models.ForeignKey('Driver', on_delete=models.SET_NULL, null=True, blank=True)
    message=models.TextField(blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

