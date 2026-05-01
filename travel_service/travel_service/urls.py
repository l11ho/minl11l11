from flights import views  # Thêm dòng này để import views
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework.routers import DefaultRouter
from search.views import TourViewSet, HotelViewSet, TransferViewSet
from flights.views import FlightViewSet  # Đảm bảo bạn đã import FlightViewSet từ views.py
from flights.views import create_flight_checkout_session

router = DefaultRouter()
router.register(r'tours', TourViewSet)
router.register(r'hotels', HotelViewSet)
router.register(r'transfers', TransferViewSet)
router.register(r'flights', FlightViewSet, basename='flight')  # Đăng ký API chuyến bay với router


def home(request):
    return HttpResponse("Django backend dang chay thanh cong!")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/payment/', include('payment.urls')),
    path('api/', include('flights.urls')),
    #path('api/payment/create-flight-checkout-session/', views.create_flight_checkout_session, name='create_flight_checkout_session'),
    path('chat/', include('chat.urls')),
    path('flights/', include('flights.urls')),
]