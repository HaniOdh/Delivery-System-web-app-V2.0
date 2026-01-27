from django.db import transaction
from core.models.models import Payment, Invoice

@transaction.atomic
def pay(payment: Payment, amount):
    """
    Process payment and update invoice status based on remaining amount.
    Updates invoice rest and status according to payment amount.
    """
    invoice = payment.invoice
    
    # Update client's sold (debt)
    payment.client.solld -= amount
    payment.client.save(update_fields=["solld"])
    
    # Update invoice rest
    invoice.rest -= amount
    
    # Ensure rest doesn't go negative
    if invoice.rest < 0:
        invoice.rest = 0
    
    # Allow small overpayment (up to 1 DA) - consider it as fully paid
    # This handles cases where client pays rounded amount (e.g., 2003 for 2002.5)
    if invoice.rest < 0 or (invoice.rest >= 0 and invoice.rest <= 1):
        invoice.rest = 0
        invoice.status = 'payee'  # Fully paid
    elif invoice.rest < invoice.amount_ttc:
        invoice.status = 'part-payee'  # Partially paid
    else:
        invoice.status = 'non-payee'  # Not paid
    
    invoice.save(update_fields=["rest", "status"])