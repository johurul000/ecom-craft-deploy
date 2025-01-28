from django.contrib.auth.models import BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extar_fields):
        if not email:
            raise ValueError('Email Field Must Be Set!!')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extar_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Super User Must have is_staff=True')
        if  extra_fields.get('is_superuser') is not True:
            raise  ValueError('Super User must have is_superuser=True')
        return self.create_user(email, username, password, **extra_fields)