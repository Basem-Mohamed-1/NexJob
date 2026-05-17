from django.shortcuts import render, get_object_or_404
from .models import Opportunity, Company
from django.http import JsonResponse
from django.contrib.auth.models import User
from jobseeker.models import Application
import json

def dashboard(request):
    
    return render(request, 'company/Dashboard.html')


def create_job(request):
    return render(request, 'company/create_a_new_opportunity.html')


def api_create_job(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    if request.method == "POST":
        data = json.loads(request.body)

        title = data.get("title")
        status = data.get("status")
        maxSalary = int(data.get("salaryMax"))
        minSalary = int(data.get("salaryMin"))
        location = data.get("location")
        employeeType = data.get("type")
        experience = int(data.get("experience"))
        description = data.get("description")
        respons = data.get("responsibilities")
        requirements = data.get("requirements")

        # Get company name ONLY from Profile (set at signup)
        company_name = None
        profile = getattr(request.user, 'profile', None)
        if profile and profile.company_name:
            company_name = profile.company_name
        
        # Fallback to username if no company name in profile
        if not company_name:
            company_name = request.user.username
        
        # Create or update Company record
        company, created = Company.objects.get_or_create(
            user=request.user,
            defaults={'companyName': company_name}
        )

        job = Opportunity.objects.create(
            title=title,
            companyName=company_name,
            location=location,
            experience=experience,
            jobDescription=description,
            responsibilities=respons,
            requirements=requirements,
            salary_min=minSalary,
            salary_max=maxSalary,
            employment_type=employeeType,
            status=status,
        )

        return JsonResponse({
            "message": "Job created successfully",
            "id": job.id
        })

    return JsonResponse({"error": "Invalid method"}, status=400)


def my_jobs(request):
    return render(request, 'company/my_job_postings.html')

def api_my_jobs(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    company_name = None
    try:
        company = Company.objects.get(user=request.user)
        company_name = company.companyName
    except Company.DoesNotExist:
        profile = getattr(request.user, 'profile', None)
        if profile and profile.company_name:
            company_name = profile.company_name
    
    # If no company name, fallback to username
    if not company_name:
        company_name = request.user.username
    
    # Filter jobs by company name
    jobs = Opportunity.objects.filter(companyName=company_name)
    
    jobs = jobs.order_by('-postedDate')
    
    data = []
    for op in jobs:
        data.append({
            "id": op.id,
            "title": op.title,
            "companyName": op.companyName,
            "experience": op.experience,
            "jobDescription": op.jobDescription,
            "responsibilities": op.responsibilities,
            "requirements": op.requirements,
            "location": op.location,
            "status": op.status,
            "postedDate": op.postedDate,
            "employment_type": op.employment_type,
            "salary_min": op.salary_min,
            "salary_max": op.salary_max,
        })

    return JsonResponse({
        "count": len(data),
        "opportunities": data
    })


def api_get_job(request, job_id):
    job = get_object_or_404(Opportunity, id=job_id)
    data = {
        "id": job.id,
        "title": job.title,
        "companyName": job.companyName,
        "location": job.location,
        "experience": job.experience,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "jobDescription": job.jobDescription,
        "responsibilities": job.responsibilities,
        "requirements": job.requirements,
        "status": job.status,
        "employment_type": job.employment_type,
        "postedDate": job.postedDate,
    }
    return JsonResponse(data)


def api_edit_job(request, job_id):
    if request.method == "POST":
        job = get_object_or_404(Opportunity, id=job_id)
        data = json.loads(request.body)

        job.title = data.get("title", job.title)
        job.location = data.get("location", job.location)
        # Convert to integers explicitly
        job.experience = int(data.get("experience", job.experience) or 0)
        job.salary_min = int(data.get("salaryMin", job.salary_min) or 0)
        job.salary_max = int(data.get("salaryMax", job.salary_max) or 0)
        job.jobDescription = data.get("description", job.jobDescription)
        job.responsibilities = data.get("responsibilities", job.responsibilities)
        job.requirements = data.get("requirements", job.requirements)
        job.status = data.get("status", job.status)
        job.employment_type = data.get("type", job.employment_type)

        job.save()

        return JsonResponse({"message": "Job updated successfully"})

    return JsonResponse({"error": "Invalid method"}, status=400)


def api_delete_job(request, job_id):
    if request.method == "POST":
        job = get_object_or_404(Opportunity, id=job_id)
        job.delete()
        return JsonResponse({"message": "Job deleted successfully"})
    
    return JsonResponse({"error": "Invalid method"}, status=400)


def applications(request):
    return render(request, 'company/applications.html')

def api_applications(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    # Get company name from Profile (set at signup)
    company_name = None
    profile = getattr(request.user, 'profile', None)
    if profile and profile.company_name:
        company_name = profile.company_name
    
    # If no company name in profile, show empty (user needs to set up company in signup)
    if not company_name:
        return JsonResponse({
            "count": 0,
            "applications": []
        })
    
    # Get jobs for this company
    company_jobs = Opportunity.objects.filter(companyName=company_name).values_list('id', flat=True)
    
    # Get applications only for this company's jobs
    applications = Application.objects.filter(opportunity_id__in=company_jobs).order_by('-applied_at')
    
    opportunity_id = request.GET.get('opportunity_id')
    if opportunity_id:
        applications = applications.filter(opportunity_id=opportunity_id)
    
    status = request.GET.get('status')
    if status:
        applications = applications.filter(status=status)
    
    data = [
        {
            "id": app.id,
            "full_name": app.full_name,
            "email": app.email,
            "phone": app.phone,
            "opportunity_id": app.opportunity_id,
            "experience": app.experience,
            "expected_salary": app.expected_salary,
            "start_date": app.start_date.isoformat() if app.start_date else None,
            "applied_at": app.applied_at.strftime('%b %d, %Y'),
            "status": app.status,
            "cover_letter": app.cover_letter,
            "resume": app.resume.url if app.resume else None,
        }
        for app in applications
    ]
    
    return JsonResponse({
        "count": len(data),
        "applications": data
    })


def api_update_application_status(request, application_id):
    if request.method == "POST":
        application = get_object_or_404(Application, id=application_id)
        data = json.loads(request.body)
        
        application.status = data.get("status", application.status)
        application.save()
        
        return JsonResponse({"message": "Status updated successfully"})
    
    return JsonResponse({"error": "Invalid method"}, status=400)


def api_job_applicant_count(request, job_id):
    if request.method == "GET":
        count = Application.objects.filter(opportunity_id=job_id).count()
        return JsonResponse({"count": count})
    
    return JsonResponse({"error": "Invalid method"}, status=400)


def settings(request):
    return render(request, 'company/Company_settings.html')


def profile(request):
    return render(request, 'company/profile.html')


def edit_job(request):
    return render(request, 'company/Edit_job.html')


# ==================== Company Settings API ====================

def api_get_settings(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    user = request.user
    data = {
        'username': user.username,
        'email': user.email,
    }
    
    # Try to get company profile
    try:
        company = Company.objects.get(user=user)
        data['company_name'] = company.companyName
        data['website'] = company.website
        data['location'] = company.location
        data['description'] = company.description
    except Company.DoesNotExist:
        # Get company name from Profile if exists
        profile = getattr(user, 'profile', None)
        if profile and profile.company_name:
            data['company_name'] = profile.company_name
            data['website'] = ''
            data['location'] = ''
            data['description'] = ''
        else:
            data['company_name'] = ''
            data['website'] = ''
            data['location'] = ''
            data['description'] = ''
    
    return JsonResponse(data)


def api_save_account(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        
        user = request.user
        new_username = data.get('username', '').strip()
        new_email = data.get('email', '').strip()
        
        if not new_username or not new_email:
            return JsonResponse({'error': 'Username and email are required'}, status=400)
        
        # Check if username is taken by another user
        if User.objects.exclude(pk=user.pk).filter(username=new_username).exists():
            return JsonResponse({'error': 'Username is already taken'}, status=400)
        
        # Check if email is taken by another user
        if User.objects.exclude(pk=user.pk).filter(email=new_email).exists():
            return JsonResponse({'error': 'Email is already taken'}, status=400)
        
        user.username = new_username
        user.email = new_email
        user.save()
        
        return JsonResponse({'success': True, 'message': 'Account updated successfully'})
    
    return JsonResponse({'error': 'Invalid method'}, status=400)


def api_save_company_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        
        company_name = data.get('company_name', '').strip()
        website = data.get('website', '').strip()
        location = data.get('location', '').strip()
        description = data.get('description', '').strip()
        
        if not company_name:
            return JsonResponse({'error': 'Company name is required'}, status=400)
        
        # Get old company name (for updating old opportunities)
        old_company_name = None
        try:
            company = Company.objects.get(user=request.user)
            old_company_name = company.companyName
        except Company.DoesNotExist:
            profile = getattr(request.user, 'profile', None)
            if profile and profile.company_name:
                old_company_name = profile.company_name
        
        # Update or create Company record
        company, created = Company.objects.get_or_create(
            user=request.user,
            defaults={
                'companyName': company_name,
                'website': website,
                'location': location,
                'description': description,
            }
        )
        
        if not created:
            company.companyName = company_name
            company.website = website
            company.location = location
            company.description = description
            company.save()
        
        # Also update Profile.company_name
        profile = getattr(request.user, 'profile', None)
        if profile:
            profile.company_name = company_name
            profile.save()
        
        # Update ALL old opportunities if company name changed
        if old_company_name and old_company_name != company_name:
            Opportunity.objects.filter(companyName=old_company_name).update(companyName=company_name)
        
        return JsonResponse({'success': True, 'message': 'Company profile saved successfully'})
    
    return JsonResponse({'error': 'Invalid method'}, status=400)