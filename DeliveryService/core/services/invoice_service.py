from django.db import transaction
from core.models.models import Shipment, Invoice


@transaction.atomic
def add_shipment_to_invoice(invoice: Invoice , amount):


    if invoice is None:
        return  # nothing to do

    

    invoice.amount_ht += amount
    
    invoice.save(update_fields=["amount_ht"])


def calculate_ttv(invoice:Invoice):

    if invoice is None:
        return  # nothing to do

    invoice.amount_ttc = invoice.amount_vat*invoice.amount_ht + invoice.amount_ht
    invoice.save(update_fields=["amount_ttc"])
    return invoice.amount_ttc
    
   