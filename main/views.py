from django.shortcuts import render

def home(request):
    return render(request, 'root/index.html')

def about(request):
    return render(request, 'shared/About.html')

def contact(request):
    return render(request, 'shared/Contact_us.html')