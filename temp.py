from django.db import models
from django.contrib.auth import get_user_model

class PaymentInformation(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    card_number = models.CharField(max_length=16)
    expiration_date = models.DateField()
    # Add more fields as needed


from django.db import models
from django.contrib.auth import get_user_model

class Order(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    order_number = models.CharField(max_length=100)
    order_date = models.DateTimeField(auto_now_add=True)
    # Add more fields as needed

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=255)
    quantity = models.IntegerField()
    # Add more fields as needed


from django.db import models
from django.contrib.auth import get_user_model

class Wishlist(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    products = models.ManyToManyField('Product')  # Assuming you have a Product model



from django.db import models
from django.contrib.auth import get_user_model

class Review(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


from django.db import models
from django.contrib.auth import get_user_model

class Preferences(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE)
    language = models.CharField(max_length=50)
    currency = models.CharField(max_length=10)
    # Add more fields as needed
