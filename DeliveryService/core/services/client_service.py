from django.db import transaction
from core.models.models import Client, Invoice

@transaction.atomic
def add_price_to_sold(client: Client , amount):



    

    client.solld += amount
    
    client.save(update_fields=["solld"])