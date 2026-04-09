from rest_framework_simplejwt.views import TokenObtainPairView

from .jwt_serializers import StaffTokenObtainPairSerializer


class StaffTokenObtainPairView(TokenObtainPairView):
    serializer_class = StaffTokenObtainPairSerializer
