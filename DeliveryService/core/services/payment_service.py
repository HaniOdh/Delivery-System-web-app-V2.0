from django.db import transaction
from core.models.models import Payment, Invoice

@transaction.atomic
def pay(payment: Payment , amount):



    

    payment.client.solld -= amount
    
    payment.client.save(update_fields=["solld"])