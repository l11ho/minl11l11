from django.db import models

class Tour(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    destination = models.CharField(max_length=255)
    rating = models.FloatField(default=0)

    image = models.URLField(blank=True, null=True)
    duration = models.CharField(max_length=100, blank=True, null=True)
    departure = models.CharField(max_length=255, blank=True, null=True)

    included = models.TextField(blank=True, null=True)
    excluded = models.TextField(blank=True, null=True)
    children_policy = models.TextField(blank=True, null=True)
    payment_terms = models.TextField(blank=True, null=True)
    registration_terms = models.TextField(blank=True, null=True)
    cancel_note = models.TextField(blank=True, null=True)
    normal_cancel_policy = models.TextField(blank=True, null=True)
    holiday_cancel_policy = models.TextField(blank=True, null=True)
    force_majeure = models.TextField(blank=True, null=True)
    contact = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class TourDepartureSchedule(models.Model):
    tour = models.ForeignKey(
        Tour,
        on_delete=models.CASCADE,
        related_name='departure_schedules'
    )
    date = models.DateField()
    code = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='VND')

    def __str__(self):
        return f'{self.tour.name} - {self.date}'

class Hotel(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=255)
    rating = models.FloatField()

class Transfer(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.DurationField()

class HotelReview(models.Model):
    hotel = models.ForeignKey(
        "Hotel",
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    user_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True)

    rating = models.DecimalField(max_digits=3, decimal_places=1)

    cleanliness = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    room_comfort = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    food = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    location_score = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    service_score = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)

    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.hotel.name} - {self.user_name} - {self.rating}/10"