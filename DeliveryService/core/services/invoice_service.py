from django.db import transaction
from core.models.models import Shipment, Invoice


@transaction.atomic
def add_shipment_to_invoice(invoice: Invoice, amount):
    """
    Add shipment amount to invoice and recalculate totals.
    This updates amount_ht, TVA, TTC and rest.
    """
    if invoice is None:
        return  # nothing to do

    # Add to HT (before tax) and round to 2 decimals
    invoice.amount_ht = round(invoice.amount_ht + amount, 2)
    
    # Recalculate TVA (19%) and round to 2 decimals
    invoice.amount_vat = round(invoice.amount_ht * 0.19, 2)
    
    # Recalculate TTC (total with tax) and round to 2 decimals
    invoice.amount_ttc = round(invoice.amount_ht + invoice.amount_vat, 2)
    
    # Update rest (remaining to pay)
    invoice.rest = invoice.amount_ttc
    
    # Update status
    if invoice.rest == 0:
        invoice.status = 'payee'
    elif invoice.rest < invoice.amount_ttc:
        invoice.status = 'part-payee'
    else:
        invoice.status = 'non-payee'
    
    invoice.save(update_fields=["amount_ht", "amount_vat", "amount_ttc", "rest", "status"])


def calculate_ttv(invoice: Invoice):
    """
    Calculate and update TTC (Total with 19% TVA).
    Returns the TTC amount.
    """
    if invoice is None:
        return  # nothing to do

    # Calculate TVA (19%) and round to 2 decimals
    invoice.amount_vat = round(invoice.amount_ht * 0.19, 2)
    
    # Calculate TTC and round to 2 decimals
    invoice.amount_ttc = round(invoice.amount_ht + invoice.amount_vat, 2)
    
    invoice.save(update_fields=["amount_vat", "amount_ttc"])
    return invoice.amount_ttc
    
   