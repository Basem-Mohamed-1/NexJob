from django.shortcuts import render

def dashboard(request):
    return render(request, 'company/Dashboard.html')

def create_job(request):
    return render(request, 'company/create_a_new_opportunity.html')

def my_jobs(request):
    return render(request, 'company/my_job_postings.html')

def applications(request):
    return render(request, 'company/applications.html')

def settings(request):
    return render(request, 'company/Company_settings.html')

def profile(request):
    return render(request, 'company/profile.html')