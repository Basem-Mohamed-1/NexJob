from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.home, name='jobseeker_home'),
    path('find-jobs/', views.find_jobs, name='find_jobs'),
    path('job-details/', views.job_details, name='job_details'),
    path('apply/', views.apply_job, name='apply_job'),
    path('my-applications/', views.my_applications, name='my_applications'),
    path('profile/', views.profile, name='jobseeker_profile'),
]