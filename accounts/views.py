from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Profile
from django.contrib import messages
from django.db import transaction
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse

def is_admin(user):
    if user.is_superuser:
        return True
    profile = getattr(user, 'profile', None)
    return profile and profile.user_type == 'admin'

def is_seeker(user):
    profile = getattr(user, 'profile', None)
    return profile and profile.user_type == 'seeker'


def signup_view(request):
    if request.method == 'POST':
        data = request.POST
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        user_type = data.get('user_type', 'seeker') 
        company_name = data.get('company_name')

        def render_with_error(error_msg):
            messages.error(request, error_msg)
            return render(request, 'auth/signup.html', {
                'form_data': {
                    'username': username,
                    'email': email,
                    'company_name': company_name,
                    'user_type': user_type,
                }
            })
 

        # Basic validation

        if user_type == 'admin' and not company_name:
            return render_with_error("Company name is required for admin accounts.")

        if password != confirm_password:
            return render_with_error("Passwords do not match.")
    
        if User.objects.filter(username=username).exists():
            return render_with_error("Username already taken.")
        
        if User.objects.filter(email=email).exists():
            return render_with_error("An account with this email already exists.")

        try:
            validate_password(password)
        except ValidationError as e:
            return render_with_error(" ".join(e.messages))
        
        # Create the User and Profile[cite: 6, 7]
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=username, 
                    email=email, 
                    password=password
                )
                Profile.objects.create(
                    user=user, 
                    user_type=user_type, 
                    company_name=company_name if user_type == 'admin' else None
                )
        except Exception as e:
            return render_with_error("An unexpected error occurred. Please try again.")
        
        messages.success(request, "Account created! Please login.")
        return redirect('login')
        
    return render(request, 'auth/signup.html')

def login_view(request):
    # to redirect users who already logged in
    if request.user.is_authenticated:
        logout(request)
        # We don't redirect yet; we let the code continue to render the login page
        messages.info(request, "You have been logged out. Please log in again.")
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')


        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            profile = getattr(user, 'profile', None)          
            if profile and profile.user_type == 'admin':
                return redirect('admin_dashboard')
            return redirect('jobseeker_home')
        else:
            messages.error(request, "Invalid username or password")

    return render(request, 'auth/login.html')

def logout_view(request):
    logout(request)
    messages.success(request, "Logged out successfully.")
    return redirect('login')


def home_view(request):
    return render(request, 'home.html')

@login_required
def admin_dashboard(request):
    if not is_admin(request.user):
        messages.error(request, "You do not have permission to access the admin dashboard.")
        return redirect('home')
    return render(request, 'company/Dashboard.html')


@login_required
def api_change_password(request):
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        
        new_password = data.get('new_password', '')
        confirm_password = data.get('confirm_password', '')
        
        if not new_password or not confirm_password:
            return JsonResponse({'error': 'Password is required'}, status=400)
        
        if new_password != confirm_password:
            return JsonResponse({'error': 'Passwords do not match'}, status=400)
        
        if len(new_password) < 6:
            return JsonResponse({'error': 'Password must be at least 6 characters'}, status=400)
        
        # Set the new password
        request.user.set_password(new_password)
        request.user.save()
        
        # Re-login the user with the new password
        from django.contrib.auth import login
        login(request, request.user)
        
        return JsonResponse({'success': True, 'message': 'Password updated successfully'})
    
    return JsonResponse({'error': 'Invalid method'}, status=400)