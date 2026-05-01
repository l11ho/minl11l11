from django.urls import path
from .views import (
    create_checkout_session,
    create_flight_checkout_session,
    create_hotel_checkout_session,
    stripe_webhook,
)

urlpatterns = [
    path("create-checkout-session/", create_checkout_session, name="create_checkout_session"),
    path("create-flight-checkout-session/", create_flight_checkout_session, name="create_flight_checkout_session"),
    path("create-hotel-checkout-session/", create_hotel_checkout_session, name="create_hotel_checkout_session"),
    path('stripe-webhook/', stripe_webhook, name='stripe-webhook'),
]