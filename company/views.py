from django.shortcuts import render
from .models import Opportunity ,Company

def dashboard(request):
    return render(request, 'company/Dashboard.html')

def create_job(request):

    if request.method == "POST" : 

        title = request.POST.get("job_title")

        companyName = request.POST.get("company_name")

        status = request.POST.get("status")

        maxSalary =  int(request.POST.get("salary_max"))
        minSalary = int(request.POST.get("salary_min"))

        location = request.POST.get("location")

        employeeType = request.POST.get("employment_type")

        experience = int(request.POST.get("experience"))

        description = request.POST.get("description")

        respons = request.POST.get("responsibilities")

        requirements = request.POST.get("requirements")

        Opportunity.objects.create(
            title = title,
            companyName= companyName,
            location = location,
            experience = experience,
            jobDescription = description,
            responsibilities = respons,
            requirements = requirements,
            salary_min = minSalary,
            salary_max = maxSalary ,
            employment_type = employeeType,
            status = status,
        )
        
    return render(request, 'company/create_a_new_opportunity.html')

def my_jobs(request):
    return render(request, 'company/my_job_postings.html')

def applications(request):
    return render(request, 'company/applications.html')

def settings(request):
    return render(request, 'company/Company_settings.html')

def profile(request):
    return render(request, 'company/profile.html')