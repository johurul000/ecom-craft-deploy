from django.db import models

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='children')

    class Meta:
        verbose_name_plural = 'categories'
    
    def __str__(self):
        return self.name

class Product(models.Model):
    product_name = models.CharField(max_length=256)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey('Category', on_delete=models.PROTECT)
    brand = models.CharField(max_length=100)
    stock_quantity = models.IntegerField(default=0)
    sku = models.CharField(max_length=50, unique=True)
    availability = models.BooleanField(default=True)
    shipping_weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    shipping_dimensions = models.CharField(max_length=100)
    discounts = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    product_image = models.ImageField(upload_to='product_images', blank=True)
    is_deleted = models.BooleanField(default=False)


    def __str__(self):
        return self.product_name
    

class Image(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='product_images')


class Attribute(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=100)


class RelatedProduct(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='related_products')
    related_products = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='related_to')
    





