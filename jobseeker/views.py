from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from company.models import Opportunity
from .models import Application, JobseekerProfile
import json


def home(request):
    return render(request, 'jobseeker/home.html')


def api_jobs(request):
    try:
        jobs = Opportunity.objects.filter(status='OPEN').order_by('-postedDate')
        data = [{
            'id': job.id,
            'title': job.title,
            'companyName': job.companyName,
            'location': job.location,
            'employment_type': job.get_employment_type_display(),
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'postedDate': job.postedDate.strftime('%b %d, %Y'),
        } for job in jobs]
        return JsonResponse({'jobs': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def api_job_detail(request, job_id):
    try:
        job = get_object_or_404(Opportunity, id=job_id)
        data = {
            'id': job.id,
            'title': job.title,
            'companyName': job.companyName,
            'location': job.location,
            'employment_type': job.get_employment_type_display(),
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'experience': job.experience,
            'jobDescription': job.jobDescription,
            'responsibilities': job.responsibilities,
            'requirements': job.requirements,
            'postedDate': job.postedDate.strftime('%b %d, %Y'),
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def api_my_applications(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    applications = Application.objects.filter(user=request.user).order_by('-applied_at')
    data = []
    for app in applications:
        job_data = None
        try:
            opportunity = Opportunity.objects.get(id=app.opportunity_id)
            job_data = {
                'id': opportunity.id,
                'title': opportunity.title,
                'companyName': opportunity.companyName,
                'location': opportunity.location,
                'employment_type': opportunity.get_employment_type_display(),
            }
        except Opportunity.DoesNotExist:
            job_data = None

        data.append({
            'id': app.id,
            'opportunity_id': app.opportunity_id,
            'full_name': app.full_name,
            'email': app.email,
            'status': app.status,
            'status_display': app.get_status_display(),
            'applied_at': app.applied_at.strftime('%b %d, %Y'),
            'job': job_data,
        })
    return JsonResponse({'applications': data})


@login_required
def find_jobs(request):
    jobs = Opportunity.objects.filter(status='OPEN').order_by('-postedDate')
    return render(request, 'jobseeker/findJob.html', {'jobs': list(jobs)})


@login_required
def job_details(request, job_id):
    job = get_object_or_404(Opportunity, id=job_id)
    return render(request, 'jobseeker/JobDetails.html', {'job': job})


@login_required
def apply_job(request, job_id):
    job = get_object_or_404(Opportunity, id=job_id)
    return render(request, 'jobseeker/apply-job.html', {'job': job})


def api_apply_job(request):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Please login to apply'}, status=401)
    
    if request.method == 'POST':
        
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
        
        job_id = data.get('job_id')
        if not job_id:
            return JsonResponse({'success': False, 'error': 'Missing job_id'}, status=400)
        
        try:
            opportunity = get_object_or_404(Opportunity, id=job_id)
        except:
            return JsonResponse({'success': False, 'error': 'Job not found'}, status=404)
        
        application = Application(
            user=request.user,
            opportunity_id=job_id,
            full_name=data.get('full_name', ''),
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            cover_letter=data.get('cover_letter', ''),
            experience=data.get('experience', 0),
            expected_salary=data.get('expected_salary', ''),
            start_date=data.get('start_date') or None,
        )
        
        application.save()
        
        return JsonResponse({'success': True, 'application_id': application.id})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)


def api_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    profile, created = JobseekerProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        data = {
            'username': request.user.username,
            'email': request.user.email,
            'fullName': f"{request.user.first_name} {request.user.last_name}".strip(),
            'phone': profile.phone or '',
            'location': profile.location or '',
            'skills': profile.skills or '',
        }
        return JsonResponse(data)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        
        user = request.user
        name_parts = data.get('fullName', '').split(' ', 1)
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        user.email = data.get('email', user.email)
        user.save()
        
        profile.phone = data.get('phone', '')
        profile.location = data.get('location', '')
        profile.skills = data.get('skills', '')
        profile.save()
        
        return JsonResponse({'success': True})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)


def api_job_for_application(request, job_id):
    try:
        job = get_object_or_404(Opportunity, id=job_id)
        data = {
            'id': job.id,
            'title': job.title,
            'companyName': job.companyName,
            'location': job.location,
            'employment_type': job.get_employment_type_display(),
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': 'Job not found', 'deleted': True}, status=404)


@login_required
def my_applications(request):
    applications = Application.objects.filter(user=request.user).order_by('-applied_at')
    return render(request, 'jobseeker/myapplications.html', {'applications': applications})


@login_required
def profile(request):
    return render(request, 'jobseeker/profile.html')