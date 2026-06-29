from rest_framework import serializers
from .models import Tour, Hotel, Transfer, TourDepartureSchedule
from .models import HotelReview

class TourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        fields = ['id', 'name', 'price', 'destination', 'rating']

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['id', 'name', 'price', 'location', 'rating']

class TransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transfer
        fields = ['id', 'name', 'price', 'duration']

class HotelReviewSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source="hotel.name", read_only=True)

    class Meta:
        model = HotelReview
        fields = [
            "id",
            "hotel",
            "hotel_name",
            "user_name",
            "email",
            "rating",
            "cleanliness",
            "room_comfort",
            "food",
            "location_score",
            "service_score",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "hotel_name", "created_at"]

    def validate_rating(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("Rating must be between 0 and 10.")
        return value

    def validate(self, attrs):
        score_fields = [
            "cleanliness",
            "room_comfort",
            "food",
            "location_score",
            "service_score",
        ]

        for field in score_fields:
            value = attrs.get(field)
            if value is not None and (value < 0 or value > 10):
                raise serializers.ValidationError({
                    field: "Score must be between 0 and 10."
                })

        return attrs

class TourDepartureScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourDepartureSchedule
        fields = ['id', 'date', 'code', 'price', 'currency']


class TourSerializer(serializers.ModelSerializer):
    departure_schedules = TourDepartureScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Tour
        fields = [
            'id',
            'name',
            'price',
            'destination',
            'rating',
            'image',
            'duration',
            'departure',
            'included',
            'excluded',
            'children_policy',
            'payment_terms',
            'registration_terms',
            'cancel_note',
            'normal_cancel_policy',
            'holiday_cancel_policy',
            'force_majeure',
            'contact',
            'departure_schedules',
        ]