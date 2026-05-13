from django.shortcuts import render
from .models import Opportunity ,Company
from django.http import JsonResponse
import json

def dashboard(request):
    return render(request, 'company/Dashboard.html')




def create_job(request):
    return render(request, 'company/create_a_new_opportunity.html')




def api_create_job(request):

    if request.method == "POST" : 


            data = json.load(request.body())

            title = data.get("title")

            companyName = data.get("company")

            status = data.get("status")

            maxSalary =  int(data.get("salary_max"))
            minSalary = int(data.get("salaryMax"))

            location = data.get("location")

            employeeType = data.get("type")

            experience = int(data.get("experience"))

            description = data.get("description")

            respons = data.get("responsibilities")

            requirements = data.get("requirements")

            job = Opportunity.objects.create(
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

            return JsonResponse({
                "message": "Job created successfully",
                "id": job.id
            })

    return JsonResponse({"error": "Invalid method"}, status=400)

        
    


def my_jobs(request):
    return render(request, 'company/my_job_postings.html')

def api_my_jobs(request):

    jobs = Opportunity.objects.all()

    # If request wants JSON (API call)
    # if request.headers.get('Accept') == 'application/json':
    data = [
        {
            "id": op.id,
            "title": op.title,
            "companyName" : op.companyName,
            "experience" : op.experience ,
            "jobDescription" : op.jobDescription,
            "responsibilities" : op.responsibilities,
            "requirements" : op.requirements,
            "location": op.location,
            "status": op.status,
            "postedDate": op.postedDate,
            "employment_type" : op.employment_type,
        }
        for op in jobs
    ]

    return JsonResponse({
        "count": len(data),
        "opportunties": data
    })


def applications(request):
    return render(request, 'company/applications.html')

def settings(request):
    return render(request, 'company/Company_settings.html')

def profile(request):
    return render(request, 'company/profile.html')