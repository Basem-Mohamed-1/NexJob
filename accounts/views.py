from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Profile
from django.contrib import messages

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
        
        messages.success(request, "Account created! Please login.")
        return redirect('login')
        
    return render(request, 'auth/signup.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            if user.profile.user_type == 'admin':
                return redirect('admin_dashboard')
            else:
                return redirect('home')
        else:
            messages.error(request, "Invalid username or password")
            
    return render(request, 'auth/login.html')

def logout_view(request):
    logout(request)
    return redirect('login')
