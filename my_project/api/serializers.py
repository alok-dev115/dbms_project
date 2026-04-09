from rest_framework import serializers

from .models import Agent, Buyer, Owner, Property, Rent, Sale, Tenant


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = ("owner_id", "name", "phone", "email")


class AgentSerializer(serializers.ModelSerializer):
    total_sales = serializers.IntegerField(read_only=True, required=False)
    total_rentals = serializers.IntegerField(read_only=True, required=False)
    total_sale_value = serializers.DecimalField(
        max_digits=18, decimal_places=2, read_only=True, required=False
    )
    avg_deal_value = serializers.DecimalField(
        max_digits=18, decimal_places=2, read_only=True, required=False
    )

    class Meta:
        model = Agent
        fields = (
            "agent_id",
            "name",
            "contact",
            "email",
            "rating",
            "total_sales",
            "total_rentals",
            "total_sale_value",
            "avg_deal_value",
        )


class BuyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buyer
        fields = ("buyer_id", "name", "phone", "email")


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ("tenant_id", "name", "phone", "email")


class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = (
            "property_id",
            "address",
            "city",
            "locality",
            "property_type",
            "size",
            "no_of_bedroom",
            "listed_price",
            "listed_date",
            "construction_year",
            "current_status",
            "owner_id",
            "agent_id",
        )


class PropertyWriteSerializer(serializers.ModelSerializer):
    """Create Property; `property_type` maps to DB column `type`."""

    class Meta:
        model = Property
        fields = (
            "address",
            "city",
            "locality",
            "property_type",
            "size",
            "no_of_bedroom",
            "listed_price",
            "listed_date",
            "construction_year",
            "current_status",
            "owner_id",
            "agent_id",
        )


class PropertyDetailSerializer(PropertySerializer):
    owner = OwnerSerializer(read_only=True)
    agent = AgentSerializer(read_only=True)

    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + ("owner", "agent")


class SaleListSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    buyer = BuyerSerializer(read_only=True)
    agent = AgentSerializer(read_only=True)

    class Meta:
        model = Sale
        fields = ("property", "buyer", "agent", "sale_date", "final_price", "days_on_market")


class RentListSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    tenant = TenantSerializer(read_only=True)
    agent = AgentSerializer(read_only=True)
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Rent
        fields = (
            "property",
            "tenant",
            "agent",
            "start_date",
            "end_date",
            "monthly_rent",
            "is_active",
        )

    def get_is_active(self, obj):
        from django.utils import timezone

        today = timezone.now().date()
        if obj.start_date > today:
            return False
        if obj.end_date is None:
            return True
        return today <= obj.end_date


class SaleNestedSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    buyer = BuyerSerializer(read_only=True)

    class Meta:
        model = Sale
        fields = ("property", "buyer", "sale_date", "final_price", "days_on_market")


class RentNestedSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    tenant = TenantSerializer(read_only=True)

    class Meta:
        model = Rent
        fields = ("property", "tenant", "start_date", "end_date", "monthly_rent")


class AgentDetailSerializer(AgentSerializer):
    sales = SaleNestedSerializer(many=True, read_only=True, source="sale")
    rentals = RentNestedSerializer(many=True, read_only=True, source="rent")

    class Meta(AgentSerializer.Meta):
        fields = AgentSerializer.Meta.fields + ("sales", "rentals")


class CustomQuerySerializer(serializers.Serializer):
    query = serializers.CharField(trim_whitespace=True)
