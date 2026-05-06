from django.shortcuts import render

def home(request):
    return render(request, 'jobseeker/home.html')

def find_jobs(request):
    return render(request, 'jobseeker/findJob.html')

def job_details(request):
    return render(request, 'jobseeker/JobDetails.html')

def apply_job(request):
    return render(request, 'jobseeker/apply-job.html')

def my_applications(request):
    return render(request, 'jobseeker/myapplications.html')

def profile(request):
    return render(request, 'jobseeker/profile.html')