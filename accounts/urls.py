from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('', views.home_view, name='home'), 
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    
    # API
    path('api/change-password/', views.api_change_password, name='api_change_password'),
]