import re
from decimal import Decimal

from django.db import connection
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Agent, Property, Rent, Sale
from .permissions import IsAdminUserJWT
from .serializers import (
    AgentDetailSerializer,
    AgentSerializer,
    CustomQuerySerializer,
    PropertyDetailSerializer,
    PropertySerializer,
    PropertyWriteSerializer,
    RentListSerializer,
    SaleListSerializer,
)
from .utils import err, ok


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class WrappedListMixin:
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return ok(
                {
                    "count": self.paginator.page.paginator.count,
                    "next": self.paginator.get_next_link(),
                    "previous": self.paginator.get_previous_link(),
                    "results": serializer.data,
                }
            )
        serializer = self.get_serializer(queryset, many=True)
        return ok(serializer.data)


class WrappedRetrieveMixin:
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return ok(serializer.data)


def _rows_from_cursor(cursor):
    cols = [c[0] for c in (cursor.description or [])]
    rows = cursor.fetchall()
    return [dict(zip(cols, row)) for row in rows]


def _safe_select_only(sql: str):
    q = (sql or "").strip()
    if not q:
        return False, "Query is empty."
    q_one = q.rstrip().rstrip(";").strip()
    if ";" in q_one:
        return False, "Multiple statements are not allowed."
    if not re.match(r"(?is)\Aselect\s", q_one):
        return False, "Only single SELECT statements are allowed."
    low = q_one.lower()
    for bad in (
        " into outfile",
        " into dumpfile",
        "load_file",
        "benchmark(",
        "sleep(",
        "information_schema",
    ):
        if bad in low:
            return False, "Disallowed keyword or function in query."
    return True, q_one


class PropertyListCreateView(WrappedListMixin, generics.ListCreateAPIView):
    pagination_class = StandardPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PropertyWriteSerializer
        return PropertySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return ok(
            PropertySerializer(serializer.instance).data, status=status.HTTP_201_CREATED
        )

    def get_queryset(self):
        qs = Property.objects.all().select_related("owner", "agent")
        p = self.request.query_params
        city = p.get("city")
        if city:
            qs = qs.filter(city__icontains=city)
        min_price = p.get("min_price")
        max_price = p.get("max_price")
        if min_price is not None and min_price != "":
            qs = qs.filter(listed_price__gte=min_price)
        if max_price is not None and max_price != "":
            qs = qs.filter(listed_price__lte=max_price)
        bedrooms = p.get("bedrooms")
        if bedrooms is not None and bedrooms != "":
            qs = qs.filter(no_of_bedroom=bedrooms)
        status_val = p.get("status")
        if status_val:
            qs = qs.filter(current_status__icontains=status_val)
        return qs.order_by("-listed_date", "property_id")


class PropertyDetailView(WrappedRetrieveMixin, generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Property.objects.all().select_related("owner", "agent")
    serializer_class = PropertyDetailSerializer
    lookup_field = "property_id"
    lookup_url_kwarg = "pk"


class AgentListView(WrappedListMixin, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = AgentSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return (
            Agent.objects.all()
            .annotate(
                total_sales=Count("sale", distinct=True),
                # Rent uses a composite primary key; COUNT(DISTINCT ...) on it isn't supported.
                total_rentals=Count("rent"),
                total_sale_value=Sum("sale__final_price"),
                avg_deal_value=Avg("sale__final_price"),
            )
            .order_by("-rating", "agent_id")
        )


class AgentDetailView(WrappedRetrieveMixin, generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = AgentDetailSerializer
    lookup_field = "agent_id"
    lookup_url_kwarg = "pk"

    def get_queryset(self):
        return (
            Agent.objects.all()
            .prefetch_related(
                "sale__property",
                "sale__buyer",
                "rent__property",
                "rent__tenant",
            )
            .annotate(
                total_sales=Count("sale", distinct=True),
                # Rent uses a composite primary key; COUNT(DISTINCT ...) on it isn't supported.
                total_rentals=Count("rent"),
                total_sale_value=Sum("sale__final_price"),
                avg_deal_value=Avg("sale__final_price"),
            )
        )


class SaleListView(WrappedListMixin, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SaleListSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Sale.objects.all().select_related("property", "buyer", "agent")
        p = self.request.query_params
        df = p.get("date_from")
        dt = p.get("date_to")
        if df:
            qs = qs.filter(sale_date__gte=df)
        if dt:
            qs = qs.filter(sale_date__lte=dt)
        agent_id = p.get("agent_id")
        if agent_id:
            qs = qs.filter(agent_id=agent_id)
        min_p = p.get("min_price")
        max_p = p.get("max_price")
        if min_p is not None and min_p != "":
            qs = qs.filter(final_price__gte=min_p)
        if max_p is not None and max_p != "":
            qs = qs.filter(final_price__lte=max_p)
        return qs.order_by("-sale_date")


class RentListView(WrappedListMixin, generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RentListSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Rent.objects.all().select_related("property", "tenant", "agent")
        p = self.request.query_params
        locality = p.get("locality")
        if locality:
            qs = qs.filter(property__locality__icontains=locality)
        min_r = p.get("min_rent")
        max_r = p.get("max_rent")
        if min_r is not None and min_r != "":
            qs = qs.filter(monthly_rent__gte=min_r)
        if max_r is not None and max_r != "":
            qs = qs.filter(monthly_rent__lte=max_r)
        agent_id = p.get("agent_id")
        if agent_id:
            qs = qs.filter(agent_id=agent_id)
        active = p.get("active")
        if active is not None and str(active).lower() in ("1", "true", "yes"):
            today = timezone.now().date()
            qs = qs.filter(
                Q(end_date__isnull=True) | Q(end_date__gte=today), start_date__lte=today
            )
        elif active is not None and str(active).lower() in ("0", "false", "no"):
            today = timezone.now().date()
            qs = qs.filter(end_date__lt=today)
        return qs.order_by("-start_date")


class CustomQueryView(APIView):
    permission_classes = [IsAdminUserJWT]

    def post(self, request):
        ser = CustomQuerySerializer(data=request.data)
        if not ser.is_valid():
            return err("Invalid payload.", "validation_error", 400, ser.errors)
        sql = ser.validated_data["query"]
        safe, msg_or_sql = _safe_select_only(sql)
        if not safe:
            return err(msg_or_sql, "unsafe_query", 400)
        try:
            with connection.cursor() as cursor:
                cursor.execute(msg_or_sql)
                rows = _rows_from_cursor(cursor)
            return ok({"columns": list(rows[0].keys()) if rows else [], "rows": rows})
        except Exception as exc:
            return err(str(exc), "sql_error", 400)


class DashboardStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        today = timezone.now().date()
        total_properties = Property.objects.count()
        total_sales = Sale.objects.count()
        total_rentals = Rent.objects.count()
        active_agents = (
            Agent.objects.filter(Q(sale__isnull=False) | Q(rent__isnull=False))
            .distinct()
            .count()
        )

        top_agents = list(
            Agent.objects.annotate(
                revenue=Sum("sale__final_price"),
                deals=Count("sale", distinct=True),
            )
            .filter(deals__gt=0)
            .order_by("-revenue")[:5]
            .values("agent_id", "name", "revenue", "deals")
        )

        # Sales count by month (last 12 months) for charts
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT DATE_FORMAT(sale_date, '%%Y-%%m') AS ym, COUNT(*) AS cnt, COALESCE(SUM(final_price), 0) AS vol
                FROM Sale
                WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(sale_date, '%%Y-%%m')
                ORDER BY ym
                """
            )
            sales_trend = _rows_from_cursor(cursor)

        return ok(
            {
                "totals": {
                    "properties": total_properties,
                    "sales": total_sales,
                    "rentals": total_rentals,
                    "active_agents": active_agents,
                },
                "top_agents": top_agents,
                "sales_trend": sales_trend,
            }
        )


class ReportSalesByAgentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        df = request.query_params.get("date_from")
        dt = request.query_params.get("date_to")
        qs = Sale.objects.values("agent_id", "agent__name").annotate(
            total_sales=Count("property_id"),
            total_volume=Sum("final_price"),
            avg_price=Avg("final_price"),
        )
        if df:
            qs = qs.filter(sale_date__gte=df)
        if dt:
            qs = qs.filter(sale_date__lte=dt)
        rows = list(qs.order_by("-total_volume"))
        return ok(rows)


class ReportRentalsByAgentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        df = request.query_params.get("date_from")
        dt = request.query_params.get("date_to")
        qs = Rent.objects.values("agent_id", "agent__name").annotate(
            agreements=Count("property", distinct=True),
            total_rent_collected=Sum("monthly_rent"),
        )
        if df:
            qs = qs.filter(start_date__gte=df)
        if dt:
            qs = qs.filter(start_date__lte=dt)
        rows = list(qs.order_by("-agreements"))
        return ok(rows)


class ReportTopPropertiesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        limit = int(request.query_params.get("limit", 5))
        limit = max(1, min(limit, 50))
        expensive = Property.objects.order_by("-listed_price")[:limit]
        high_rent_qs = Rent.objects.select_related("property").order_by(
            "-monthly_rent"
        )[:limit]
        return ok(
            {
                "most_expensive_listed": PropertySerializer(expensive, many=True).data,
                "highest_monthly_rent": RentListSerializer(
                    high_rent_qs, many=True
                ).data,
            }
        )


class QueryAView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        sql = """
        -- (a) Houses in Guwahati built after 2023 available for rent
        SELECT
            p.address,
            p.city,
            p.construction_year,
            p.current_status
        FROM Property p
        WHERE p.city = 'Guwahati'
          AND p.construction_year > 2023
        #   AND LOWER(COALESCE(p.`type`, '')) LIKE '%%house%%'
          AND (
            LOWER(COALESCE(p.current_status, '')) LIKE '%%rent%%'
            # OR LOWER(COALESCE(p.current_status, '')) LIKE '%%available%%'
            OR LOWER(COALESCE(p.current_status, '')) LIKE '%%rented%%'
          )
        ORDER BY p.property_id
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                rows = _rows_from_cursor(cursor)
            return ok(rows)
        except Exception as exc:
            return err(str(exc), "sql_error", 400)


class QueryBView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        sql = """
        -- (b) Houses in Guwahati costing between Rs. 20L and Rs. 60L
        SELECT
            p.address,
            p.listed_price
        FROM Property p
        WHERE p.city = 'Guwahati'
        #   AND LOWER(COALESCE(p.`type`, '')) LIKE '%%house%%'
          AND p.listed_price BETWEEN 2000000 AND 6000000
        ORDER BY p.listed_price
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                rows = _rows_from_cursor(cursor)
            return ok(rows)
        except Exception as exc:
            return err(str(exc), "sql_error", 400)


class QueryCView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        sql = """
        -- (c) Houses for rent in G.S. Road (Guwahati), 2+ bedrooms, under 15k/month, active agreement
        SELECT
            p.address,
            p.locality,
            p.no_of_bedroom,
            r.monthly_rent
        FROM Property p
        JOIN Rent r ON p.property_id = r.property_id
        WHERE p.city = 'Guwahati'
          AND (
            p.locality LIKE '%%G.S. Road%%'
            OR p.locality LIKE '%%GS Road%%'
            OR p.locality LIKE '%%G S Road%%'
            OR p.locality LIKE '%%G.S Road%%'
          )
          AND COALESCE(p.no_of_bedroom, 0) >= 2
          AND r.monthly_rent < 15000
          AND (r.end_date IS NULL OR r.end_date > CURDATE())
        ORDER BY r.monthly_rent
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                rows = _rows_from_cursor(cursor)
            return ok(rows)
        except Exception as exc:
            return err(str(exc), "sql_error", 400)


class QueryDView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        sql = """
        -- (d) Agent with highest total sales amount in 2023
        SELECT
            a.name,
            SUM(s.final_price) AS total_sales_amount
        FROM Agent a
        JOIN Sale s ON a.agent_id = s.agent_id
        WHERE YEAR(s.sale_date) = 2023
        GROUP BY a.agent_id, a.name
        ORDER BY total_sales_amount DESC
        LIMIT 1
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                rows = _rows_from_cursor(cursor)
            return ok(rows[0] if rows else None)
        except Exception as exc:
            return err(str(exc), "sql_error", 400)


class QueryEView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        sql = """
        -- (e) Avg selling price + avg days on market per agent (2018)
        SELECT
            a.name,
            AVG(s.final_price) AS avg_selling_price,
            AVG(s.days_on_market) AS avg_days_on_market
        FROM Agent a
        JOIN Sale s ON a.agent_id = s.agent_id
        WHERE YEAR(s.sale_date) = 2018
        GROUP BY a.agent_id, a.name
        ORDER BY a.agent_id
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                rows = _rows_from_cursor(cursor)
            for r in rows:
                for k, v in list(r.items()):
                    if isinstance(v, Decimal):
                        r[k] = float(v)
            return ok(rows)
        except Exception as exc:
            return err(str(exc), "sql_error", 400)


class QueryFView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        sql = """
        (SELECT 'Most Expensive House' AS category, address, listed_price AS value, type
         FROM Property
         ORDER BY listed_price DESC
         LIMIT 1)
        UNION
        (SELECT 'Highest Rent House' AS category, address, monthly_rent AS value, type
         FROM Property p JOIN Rent r ON p.property_id = r.property_id
         WHERE r.end_date > CURDATE()
         ORDER BY r.monthly_rent DESC
         LIMIT 1)
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                rows = _rows_from_cursor(cursor)
            return ok(rows)
        except Exception as exc:
            return err(str(exc), "sql_error", 400)
