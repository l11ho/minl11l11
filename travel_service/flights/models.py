from django.db import models


class Flight(models.Model):
    flight_number = models.CharField(max_length=10)
    airline = models.CharField(max_length=100)
    departure = models.CharField(max_length=3)
    arrival = models.CharField(max_length=3)
    date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    departure_time = models.TimeField(null=True, blank=True)
    arrival_time = models.TimeField(null=True, blank=True)
    duration = models.CharField(max_length=50, blank=True, default='1h 50m')
    baggage = models.CharField(max_length=50, blank=True, default='20kg')
    available_seats = models.PositiveIntegerField(default=10)
    currency = models.CharField(max_length=10, default='USD')

    def __str__(self):
        return f"{self.flight_number} - {self.airline}"