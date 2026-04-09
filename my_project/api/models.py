from django.db import models
from django.db.models import CompositePrimaryKey


class Owner(models.Model):
    owner_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "Owner"


class Agent(models.Model):
    agent_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    contact = models.CharField(max_length=100, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    rating = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "Agent"


class Buyer(models.Model):
    buyer_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "Buyer"


class Tenant(models.Model):
    tenant_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "Tenant"


class Property(models.Model):
    property_id = models.AutoField(primary_key=True)
    address = models.CharField(max_length=500, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    locality = models.CharField(max_length=200, blank=True, null=True)
    property_type = models.CharField(db_column="type", max_length=100, blank=True, null=True)
    size = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    no_of_bedroom = models.IntegerField(blank=True, null=True)
    listed_price = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    listed_date = models.DateField(blank=True, null=True)
    construction_year = models.IntegerField(blank=True, null=True)
    current_status = models.CharField(max_length=100, blank=True, null=True)
    owner = models.ForeignKey(Owner, models.DO_NOTHING, db_column="owner_id", blank=True, null=True)
    agent = models.ForeignKey(Agent, models.DO_NOTHING, db_column="agent_id", blank=True, null=True)

    class Meta:
        managed = False
        db_table = "Property"


class Sale(models.Model):
    property = models.OneToOneField(Property, models.DO_NOTHING, db_column="property_id", primary_key=True)
    buyer = models.ForeignKey(Buyer, models.DO_NOTHING, db_column="buyer_id")
    agent = models.ForeignKey(Agent, models.DO_NOTHING, db_column="agent_id", blank=True, null=True)
    sale_date = models.DateField(blank=True, null=True)
    final_price = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)
    days_on_market = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "Sale"


class Rent(models.Model):
    property = models.ForeignKey(Property, models.DO_NOTHING, db_column="property_id")
    tenant = models.ForeignKey(Tenant, models.DO_NOTHING, db_column="tenant_id")
    agent = models.ForeignKey(Agent, models.DO_NOTHING, db_column="agent_id", blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    monthly_rent = models.DecimalField(max_digits=14, decimal_places=2, blank=True, null=True)

    pk = CompositePrimaryKey("property", "start_date")

    class Meta:
        managed = False
        db_table = "Rent"
