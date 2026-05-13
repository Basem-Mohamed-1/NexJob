from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.home, name='jobseeker_home'),
    path('find-jobs/', views.find_jobs, name='find_jobs'),
    path('api/jobs/', views.api_jobs, name='api_jobs'),
    # path for job details page
    path('job-details/<int:job_id>/', views.job_details, name='job_details'),
    # API endpoint for fetching job details
    path('api/job/<int:job_id>/', views.api_job_detail, name='api_job_detail'),

    # path for user's applications page
    path('my-applications/', views.my_applications, name='my_applications'),
    # API endpoint for fetching user's applications
    path('api/applications/', views.api_my_applications, name='api_my_applications'), 
    # API endpoint for fetching job details when applying in my applications page
    path('api/job-for-app/<int:job_id>/', views.api_job_for_application, name='api_job_for_application'), 
    path('api/apply/', views.api_apply_job, name='api_apply_job'),
    path('api/profile/', views.api_profile, name='api_profile'),
    path('apply/<int:job_id>/', views.apply_job, name='apply_job'),
    path('profile/', views.profile, name='jobseeker_profile'),
]