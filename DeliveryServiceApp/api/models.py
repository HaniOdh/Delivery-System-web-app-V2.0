from django.db import models

# Create your models here.
class TypeService(models.Model):
    libelle = models.CharField(max_length=100)
    tarif_poids = models.FloatField()
    tarif_volume = models.FloatField()
    delai_estime = models.CharField(max_length=50)

    def __str__(self):
        return self.libelle

class Destination(models.Model):
    pays = models.CharField(max_length=100)
    ville = models.CharField(max_length=100)
    zone = models.CharField(max_length=50)
    tarif_base = models.FloatField()

    def __str__(self):
        return self.ville

class Client(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField()
    telephone = models.CharField(max_length=20)
    adresse = models.TextField()
    type_client = models.CharField(max_length=50)
    date_creation = models.DateField()

    def __str__(self):
        return self.nom

class Vehicule(models.Model):
    immatriculation = models.CharField(max_length=50)
    marque = models.CharField(max_length=50)
    modele = models.CharField(max_length=50)
    capacite_poids = models.FloatField()
    capacite_volume = models.FloatField()
    statut = models.CharField(max_length=50)

    def __str__(self):
        return self.immatriculation

class Chauffeur(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20)
    numero_permis = models.CharField(max_length=50)
    date_embauche = models.DateField()
    statut = models.CharField(max_length=50)

    def __str__(self):
        return self.nom

class Tournee(models.Model):
    date_tournee = models.DateField()
    kilometrage = models.FloatField()
    statut = models.CharField(max_length=50)

    def __str__(self):
        return self.date_tournee

class Expedition(models.Model):
    numero_expedition = models.CharField(max_length=50)
    date_expedition = models.DateField()
    poids = models.FloatField()
    volume = models.FloatField()
    montant_ht = models.FloatField(editable=False,null=True,blank=True)
    statut = models.CharField(max_length=50)
    id_client = models.ForeignKey(Client , on_delete= models.RESTRICT)
    id_destination = models.ForeignKey(Destination , on_delete= models.RESTRICT)
    id_typeservice = models.ForeignKey(TypeService , on_delete= models.RESTRICT)
    id_Tournee = models.ForeignKey(Tournee , on_delete= models.RESTRICT,editable=False, null=True, blank=True)


    def save(self, *args, **kwargs):
        # 🔹 Calculate montant_ht automatically
        self.montant_ht = (
            self.id_destination.tarif_base
            + (self.poids * self.id_typeservice.tarif_poids)
            + (self.volume * self.id_typeservice.tarif_volume)
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return self.numero_expedition
    



class Incident(models.Model):
    type_incident = models.CharField(max_length=100)
    description = models.TextField()
    date_incident = models.DateField()
    piece_jointe = models.CharField(max_length=255)

    def __str__(self):
        return self.type_incident

class Facture(models.Model):
    date_facture = models.DateField()
    montant_ht = models.FloatField()
    tva = models.FloatField()
    montant_ttc = models.FloatField()
    statut = models.CharField(max_length=50)
    

    def __str__(self):
        return self.id

class Paiement(models.Model):
    date_paiement = models.DateField()
    montant = models.FloatField()
    mode_paiement = models.CharField(max_length=50)
    id_facture = models.ForeignKey(Facture , on_delete= models.RESTRICT)
    def __str__(self):
        return self.id

class Reclamation(models.Model):
    objet = models.CharField(max_length=100)
    description = models.TextField()
    date_reclamation = models.DateField()
    statut = models.CharField(max_length=50)

    def __str__(self):
        return self.objet

class Utilisateur(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField()
    mot_de_passe = models.CharField(max_length=128)
    role = models.CharField(max_length=50)
    actif = models.BooleanField(default=True)
    date_creation = models.DateField()

    def __str__(self):
        return self.nom


class Pricing(models.Model):
    
    base_price = models.FloatField()
    id_service = models.ForeignKey(TypeService , on_delete= models.RESTRICT)
    id_destination = models.ForeignKey(Destination , on_delete= models.RESTRICT)

    def __str__(self):
        return self.id
