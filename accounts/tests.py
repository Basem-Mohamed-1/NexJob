from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Profile


class SignupViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.url = reverse('signup')

    def test_signup_seeker_success(self):
        response = self.client.post(self.url, {
            'username': 'testseeker',
            'email': 'seeker@example.com',
            'password': 'StrongPass1!',
            'confirm_password': 'StrongPass1!',
            'user_type': 'seeker',
        })
        self.assertRedirects(response, reverse('login'))
        user = User.objects.get(username='testseeker')
        self.assertEqual(user.profile.user_type, 'seeker')
        self.assertIsNone(user.profile.company_name)

    def test_signup_admin_success(self):
        response = self.client.post(self.url, {
            'username': 'testadmin',
            'email': 'admin@example.com',
            'password': 'StrongPass1!',
            'confirm_password': 'StrongPass1!',
            'user_type': 'admin',
            'Companyname': 'Acme Corp',
        })
        self.assertRedirects(response, reverse('login'))
        user = User.objects.get(username='testadmin')
        self.assertEqual(user.profile.user_type, 'admin')
        self.assertEqual(user.profile.company_name, 'Acme Corp')

    def test_signup_password_mismatch(self):
        response = self.client.post(self.url, {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPass1!',
            'confirm_password': 'WrongPass1!',
            'user_type': 'seeker',
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='testuser').exists())

    def test_signup_duplicate_username(self):
        User.objects.create_user(username='existing', email='old@example.com', password='pass')
        response = self.client.post(self.url, {
            'username': 'existing',
            'email': 'new@example.com',
            'password': 'StrongPass1!',
            'confirm_password': 'StrongPass1!',
            'user_type': 'seeker',
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(User.objects.filter(username='existing').count(), 1)

    def test_signup_duplicate_email(self):
        User.objects.create_user(username='user1', email='shared@example.com', password='pass')
        response = self.client.post(self.url, {
            'username': 'user2',
            'email': 'shared@example.com',
            'password': 'StrongPass1!',
            'confirm_password': 'StrongPass1!',
            'user_type': 'seeker',
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='user2').exists())

    def test_signup_admin_missing_company_name(self):
        response = self.client.post(self.url, {
            'username': 'adminnocompany',
            'email': 'a@example.com',
            'password': 'StrongPass1!',
            'confirm_password': 'StrongPass1!',
            'user_type': 'admin',
            'Companyname': '',
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='adminnocompany').exists())

    def test_signup_weak_password_rejected(self):
        response = self.client.post(self.url, {
            'username': 'weakuser',
            'email': 'weak@example.com',
            'password': 'a',
            'confirm_password': 'a',
            'user_type': 'seeker',
        })
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='weakuser').exists())

    def test_authenticated_user_redirected_from_signup(self):
        User.objects.create_user(username='loggedin', password='StrongPass1!')
        self.client.login(username='loggedin', password='StrongPass1!')
        response = self.client.get(self.url)
        self.assertRedirects(response, reverse('home'))


class LoginViewTests(TestCase):

    def setUp(self):
        self.client = Client()
        self.url = reverse('login')
        self.seeker = User.objects.create_user(
            username='seeker', email='s@example.com', password='StrongPass1!'
        )
        Profile.objects.filter(user=self.seeker).update(user_type='seeker')

        self.admin_user = User.objects.create_user(
            username='admin', email='a@example.com', password='StrongPass1!'
        )
        Profile.objects.filter(user=self.admin_user).update(
            user_type='admin', company_name='Acme'
        )

    def test_seeker_login_redirects_to_home(self):
        response = self.client.post(self.url, {
            'username': 'seeker',
            'password': 'StrongPass1!',
        })
        self.assertRedirects(response, reverse('home'))

    def test_admin_login_redirects_to_dashboard(self):
        response = self.client.post(self.url, {
            'username': 'admin',
            'password': 'StrongPass1!',
        })
        self.assertRedirects(response, reverse('admin_dashboard'))

    def test_wrong_password_stays_on_login(self):
        response = self.client.post(self.url, {
            'username': 'seeker',
            'password': 'WrongPassword!',
        })
        self.assertEqual(response.status_code, 200)

    def test_login_no_profile_does_not_crash(self):
        """Superusers or users created outside signup_view have no Profile row."""
        superuser = User.objects.create_superuser(
            username='super', email='su@example.com', password='StrongPass1!'
        )
        # Delete the auto-created profile (if signal fired) to simulate old user
        Profile.objects.filter(user=superuser).delete()
        response = self.client.post(self.url, {
            'username': 'super',
            'password': 'StrongPass1!',
        })
        # Should redirect to home, not crash with 500
        self.assertRedirects(response, reverse('home'))

    def test_authenticated_user_redirected_from_login(self):
        self.client.login(username='seeker', password='StrongPass1!')
        response = self.client.get(self.url)
        self.assertRedirects(response, reverse('home'))
