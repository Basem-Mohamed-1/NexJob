from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='company_dashboard'),
    path('create-job/', views.create_job, name='create_job'),
    path('my-jobs/', views.my_jobs, name='my_jobs'),
    path('applications/', views.applications, name='applications'),
    path('settings/', views.settings, name='company_settings'),
    path('profile/', views.profile, name='company_profile'),
]