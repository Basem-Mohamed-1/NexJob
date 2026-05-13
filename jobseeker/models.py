from django.db import models
from django.contrib.auth.models import User


class JobseekerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='jobseeker_profile')
    phone = models.CharField(max_length=20, blank=True, default='')
    location = models.CharField(max_length=100, blank=True, default='')
    skills = models.TextField(blank=True, default='')


class Application(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    opportunity_id = models.PositiveIntegerField()
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    cover_letter = models.TextField(blank=True)
    experience = models.PositiveIntegerField(default=0)
    expected_salary = models.CharField(max_length=50, blank=True)
    start_date = models.DateField(null=True, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        REVIEWING = "REVIEWING", "Reviewing"
        INTERVIEW = "INTERVIEW", "Interview"
        REJECTED = "REJECTED", "Rejected"
        HIRED = "HIRED", "Hired"

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    def __str__(self):
        return f"{self.full_name} - {self.opportunity_id}"