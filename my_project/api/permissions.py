from rest_framework.permissions import IsAuthenticated


class IsAdminUserJWT(IsAuthenticated):
    """Staff/superuser only (for custom SQL and sensitive writes)."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        user = request.user
        return bool(user and user.is_staff)
