from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='company_dashboard'),
    path('create-job/', views.create_job, name='create_job'),
    path('my-jobs/', views.my_jobs, name='my_jobs'),
    path('applications/', views.applications, name='applications'),
    path('settings/', views.settings, name='company_settings'),
    path('profile/', views.profile, name='company_profile'),
    
    # API endpoints
    path('api/my-jobs/', views.api_my_jobs, name='api_my_jobs'),
    path('api/create-job/', views.api_create_job, name='api_create_job'),
    path('api/job/<int:job_id>/', views.api_get_job, name='api_get_job'),
    path('api/job/<int:job_id>/edit/', views.api_edit_job, name='api_edit_job'),
    path('api/job/<int:job_id>/delete/', views.api_delete_job, name='api_delete_job'),
    path('api/applications/', views.api_applications, name='api_applications'),
    path('api/application/<int:application_id>/status/', views.api_update_application_status, name='api_update_application_status'),
    path('api/job/<int:job_id>/applicant-count/', views.api_job_applicant_count, name='api_job_applicant_count'),
    
    # Settings API
    path('api/settings/', views.api_get_settings, name='api_get_settings'),
    path('api/settings/account/', views.api_save_account, name='api_save_account'),
    path('api/settings/company/', views.api_save_company_profile, name='api_save_company_profile'),
]