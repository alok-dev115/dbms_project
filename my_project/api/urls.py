from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views
from .jwt_views import StaffTokenObtainPairView

urlpatterns = [
    path("token/", StaffTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("properties/", views.PropertyListCreateView.as_view(), name="property-list"),
    path("properties/<int:pk>/", views.PropertyDetailView.as_view(), name="property-detail"),
    path("agents/", views.AgentListView.as_view(), name="agent-list"),
    path("agents/<int:pk>/", views.AgentDetailView.as_view(), name="agent-detail"),
    path("sales/", views.SaleListView.as_view(), name="sale-list"),
    path("rentals/", views.RentListView.as_view(), name="rent-list"),
    path("query/", views.CustomQueryView.as_view(), name="custom-query"),
    path("dashboard/stats/", views.DashboardStatsView.as_view(), name="dashboard-stats"),
    path("reports/sales-by-agent/", views.ReportSalesByAgentView.as_view(), name="report-sales-agent"),
    path("reports/rentals-by-agent/", views.ReportRentalsByAgentView.as_view(), name="report-rentals-agent"),
    path("reports/top-properties/", views.ReportTopPropertiesView.as_view(), name="report-top-properties"),
    # Predefined assignment queries (a–f)
    path("queries/a/", views.QueryAView.as_view(), name="q-a"),
    path("queries/b/", views.QueryBView.as_view(), name="q-b"),
    path("queries/c/", views.QueryCView.as_view(), name="q-c"),
    path("queries/d/", views.QueryDView.as_view(), name="q-d"),
    path("queries/e/", views.QueryEView.as_view(), name="q-e"),
    path("queries/f/", views.QueryFView.as_view(), name="q-f"),
]
