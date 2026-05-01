# travel_service/flights/views.py

import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
import json
from rest_framework import viewsets
from .models import Flight
from .serializers import FlightSerializer
from rest_framework.decorators import api_view
#from stripe import Checkout

# Khóa API của Stripe (thay bằng khóa của bạn)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@api_view(['POST'])
def create_flight_checkout_session(request):
    if request.method == 'POST':
        try:
            data = request.data

            # Tạo một session thanh toán trên Stripe
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': data["flight_number"],  # Flight data here
                        },
                        'unit_amount': int(data["price"] * 100),  # Stripe requires the amount in cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url='http://127.0.0.1:8000/success/',
                cancel_url='http://127.0.0.1:8000/cancel/',
            )

            return JsonResponse({
                'url': session.url
            })
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            })

def create_flight_checkout_session(request):
    if request.method == "POST":
        data = json.loads(request.body)  # Lấy dữ liệu chuyến bay từ body yêu cầu

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": data["flight_number"],  # Dữ liệu chuyến bay
                            },
                            "unit_amount": data["price"] * 100,  # Giá vé tính bằng cents
                        },
                        "quantity": 1,
                    },
                ],
                mode="payment",
                success_url="http://localhost:3000/success",  # Địa chỉ redirect sau khi thanh toán thành công
                cancel_url="http://localhost:3000/cancel",  # Địa chỉ redirect khi huỷ thanh toán
            )
            return JsonResponse({'url': session.url})  # Trả về URL thanh toán

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)  # Trả về lỗi nếu có

class FlightViewSet(viewsets.ModelViewSet):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer

class FlightList(APIView):
    def get(self, request):
        flights = Flight.objects.all()
        serializer = FlightSerializer(flights, many=True)
        return Response(serializer.data)


