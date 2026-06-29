from rest_framework import viewsets, permissions
from .models import Tour, Hotel, Transfer, HotelReview
from .serializers import TourSerializer, HotelSerializer, TransferSerializer, HotelReviewSerializer

class TourViewSet(viewsets.ModelViewSet):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer

class HotelViewSet(viewsets.ModelViewSet):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer

class TransferViewSet(viewsets.ModelViewSet):
    queryset = Transfer.objects.all()
    serializer_class = TransferSerializer


class HotelReviewViewSet(viewsets.ModelViewSet):
    serializer_class = HotelReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = HotelReview.objects.select_related("hotel").all()

        hotel_id = self.request.query_params.get("hotel_id")
        if hotel_id:
            queryset = queryset.filter(hotel_id=hotel_id)

        return queryset
