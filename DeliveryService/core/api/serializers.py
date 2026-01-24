from rest_framework import serializers
from core.services.shipment_service import calculate_amount_ht
from core.services.invoice_service import add_shipment_to_invoice
from core.services.invoice_service import calculate_ttv
from core.services.client_service import add_price_to_sold
from core.services.payment_service import pay
from core.models.models import Shipment
from rest_framework.exceptions import ValidationError

from core.models.models  import (
    Client, Shipment, Driver, Vehicle,
    Destination, ServiceType, 
    Tour, Invoice, Payment, Incident, Complaint,IncidentImage
)


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'


class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = '__all__'
    
    





class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'


class TourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        fields = '__all__'


    
    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get("status", old_status)

        tour = super().update(instance, validated_data)

       
        if old_status != new_status:
            tour.shipment_set.update(status=new_status)

        return tour    


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

   

    


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = '__all__'

    def create(self, validated_data):
        service = validated_data['service']
        destination = validated_data['destination']
        invoice= validated_data['invoice']
        
        
        validated_data['amount_ht'] = calculate_amount_ht(
            weight=validated_data['weight'],
            volume=validated_data['volume'],
            price_per_weight=service.price_per_weight,
            price_per_volume=service.price_per_volume,
            base_rate=destination.base_rate
            
        )
        
        

        

        
        return super().create(validated_data)

        
        

         
    
    

    def update(self, instance, validated_data):
        # Recalculate if important fields change
        if instance.tour is not None:
            raise ValidationError({"Shipment assigned to a tour cannot be updated."
            })
        
        service = validated_data['service']
        destination = validated_data['destination']
        invoice = validated_data['invoice']
        client = validated_data['client']
        tour = validated_data['tour']

        if tour is not None:
            validated_data['status']= tour.status
        
        amount = calculate_amount_ht(
            weight=validated_data['weight'],
            volume=validated_data['volume'],
            price_per_weight=service.price_per_weight,
            price_per_volume=service.price_per_volume,
            base_rate=destination.base_rate
            
        )
            
        validated_data['amount_ht'] = amount
        if instance.invoice is None and invoice is not None:
            
            add_shipment_to_invoice(invoice =invoice,amount=amount)
            
            add_price_to_sold(client = client , amount = calculate_ttv(invoice =invoice))
        else :    validated_data['invoice']= instance.invoice
       
        
        return super().update(instance, validated_data)

        


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

    def create(self,  validated_data):
        # Recalculate if important fields change

        
        
        amount = validated_data['amount']
        payment = super().create(validated_data)

    
        pay(payment = payment , amount=amount)
        
        

            
       
        
        return payment

    def update(self, instance, validated_data):
        # Recalculate if important fields change

        
        client = validated_data['client']
        amount = validated_data['amount']
        pay(payment = instance , amount=amount)
        
        

            
       
        
        return super().update(instance, validated_data)    

class IncidentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentImage
        fields = ["id", "image", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]

class IncidentSerializer(serializers.ModelSerializer):
    images = IncidentImageSerializer(many=True, read_only=True)

    class Meta:
        model = Incident
        fields = '__all__'

       


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = '__all__'
