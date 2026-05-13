from django.db import models

# Create your models here.
class Company(models.Model):
    companyName = models.CharField(max_length=50)
    website = models.TextField(max_length=300)
    location = models.CharField(max_length=50)
    description = models.TextField(max_length=500)


class Opportunity(models.Model):


    # Company = models.ForeignKey(
    #     Company,
    #     on_delete= models.CASCADE,
    #     related_name="opportunities",null=True
    # )

    title = models.TextField(max_length=100)
    companyName = models.CharField(max_length=100,null=True)
    location = models.CharField(max_length=100)
    experience = models.PositiveBigIntegerField()
    salary_min = models.PositiveIntegerField()
    salary_max = models.PositiveIntegerField()
    jobDescription = models.TextField(max_length=500,null=True)
    responsibilities = models.TextField(max_length=1000)
    requirements = models.TextField(max_length=1000)
    postedDate = models.DateTimeField(auto_now=True)


    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        CLOSED = "CLOSED", "Closed"
        DRAFT = "DRAFT", "Draft"

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.OPEN
    )


    class EmploymentType(models.TextChoices):
        FULL_TIME = "FULL_TIME", "Full-Time"
        PART_TIME = "PART_TIME", "Part-Time"
        FREELANCE = "FREELANCE", "Freelance"

    employment_type = models.CharField(
        max_length=20,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME,
    )