from rest_framework import serializers
from core.services.shipment_service import calculate_amount_ht
from core.services.invoice_service import add_shipment_to_invoice
from core.services.invoice_service import calculate_ttv
from core.services.client_service import add_price_to_sold
from core.services.payment_service import pay
from core.services.tour_service import update_tour_statistics
from core.models.models import Shipment 
from rest_framework.exceptions import ValidationError

from core.models.models  import (
    Client, Shipment, Driver, Vehicle,
    Destination, ServiceType, 
    Tour, Invoice, Payment, Incident, Complaint
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
    client_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = '__all__'

    def get_client_name(self, obj):
        """Get the client's full name."""
        if obj.client:
            return f"{obj.client.first_name} {obj.client.last_name}"
        return "Unknown Client"

    def create(self, validated_data):
        """
        Auto-calculate TVA (19%) and TTC on creation.
        Set initial rest to TTC amount and status to 'non-payee'.
        """
        amount_ht = validated_data.get('amount_ht', 0)
        tva_rate = 0.19
        
        # Calculate TVA (19%) and round to 2 decimals
        amount_vat = round(amount_ht * tva_rate, 2)
        validated_data['amount_vat'] = amount_vat
        
        # Calculate TTC (HT + TVA) and round to 2 decimals
        validated_data['amount_ttc'] = round(amount_ht + amount_vat, 2)
        
        # Set rest to TTC (full amount to pay)
        validated_data['rest'] = validated_data['amount_ttc']
        
        # Set initial status
        validated_data['status'] = 'non-payee'

        return super().create(validated_data)


class ShipmentSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    destination_name = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Shipment
        fields = '__all__'
        read_only_fields = ['tracking_number', 'amount_ht']

    def get_client_name(self, obj):
        return str(obj.client) if obj.client else 'N/A'
    
    def get_destination_name(self, obj):
        return str(obj.destination) if obj.destination else 'N/A'
    
    def get_service_name(self, obj):
        return str(obj.service) if obj.service else 'N/A'

    def create(self, validated_data):
        from datetime import datetime
        
        service = validated_data['service']
        destination = validated_data['destination']
        invoice = validated_data.get('invoice', None)
        client = validated_data['client']
        
        # Génération automatique du tracking_number
        date_str = datetime.now().strftime('%Y%m%d')
        count = Shipment.objects.filter(tracking_number__startswith=f'TRACK-{date_str}').count() + 1
        validated_data['tracking_number'] = f'TRACK-{date_str}-{count:05d}'
        
        # Calcul du montant HT
        amount = calculate_amount_ht(
            weight=validated_data['weight'],
            volume=validated_data['volume'],
            price_per_weight=service.price_per_weight,
            price_per_volume=service.price_per_volume,
            base_rate=destination.base_rate
        )
        validated_data['amount_ht'] = amount
        
        # Créer l'expédition
        shipment = super().create(validated_data)
        
        # Si une facture est assignée, mettre à jour ses montants
        if invoice is not None:
            add_shipment_to_invoice(invoice=invoice, amount=amount)
            add_price_to_sold(client=client, amount=calculate_ttv(invoice=invoice))
        
        return shipment

        
        


    
    

    def update(self, instance, validated_data):
        # Recalculate if important fields change
        if instance.tour is not None:
            raise ValidationError({"Shipment assigned to a tour cannot be updated."
            })
        
        service = validated_data['service']
        destination = validated_data['destination']
        invoice = validated_data['invoice']
        client = validated_data['client']
        tour = validated_data.get('tour')

        if tour is not None:
            validated_data['status'] = tour.status
        
        amount = calculate_amount_ht(
            weight=validated_data['weight'],
            volume=validated_data['volume'],
            price_per_weight=service.price_per_weight,
            price_per_volume=service.price_per_volume,
            base_rate=destination.base_rate
            
        )
            
        validated_data['amount_ht'] = amount
        if instance.invoice is None and invoice is not None:
            
            add_shipment_to_invoice(invoice=invoice, amount=amount)
            
            add_price_to_sold(client=client, amount=calculate_ttv(invoice=invoice))
        else:
            validated_data['invoice'] = instance.invoice
       
        # Update the shipment
        shipment = super().update(instance, validated_data)
        
        # If tour was assigned, update tour statistics
        if tour is not None and tour != instance.tour:
            update_tour_statistics(tour)
        
        return shipment
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


class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = '__all__'


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = '__all__'
