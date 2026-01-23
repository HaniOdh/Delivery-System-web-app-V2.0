from django.db import transaction
from core.models.models import Payment, Invoice

@transaction.atomic
def pay(payment: Payment , amount):



    

    payment.client.sold -= amount
    
    payment.client.save(update_fields=["sold"])