
def calculate_amount_ht(weight,volume,price_per_weight,price_per_volume,base_rate):
    
    amount_ht=base_rate+(weight*price_per_weight)+(volume*price_per_volume)
    return amount_ht