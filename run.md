<h1>  📁 Project Structure </h1>
<pre>
NexJob/
├── NexJob/          # Project settings
├── main/            # Public pages
├── accounts/        # Login/Signup
├── company/         # Company features
├── jobseeker/       # Job seeker features
├── templates/       # HTML files
├── static/          # CSS/JS/Images
└── db.sqlite3       # Database
</pre>

---

# ⚙️ Make it work as a participate
## 1. Create virtual environment

```bash
python -m venv venv
```

## 2. Activate it

```bash
source venv/bin/activate
```
## 3. Install Django

```bash
pip install django
```
## 4. Run migrations
```bash
python manage.py migrate
```
## 5. Start server ⚠️ (with you port)
```bash
python manage.py runserver # your port here ex: 8000    
```
