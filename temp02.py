from django.db import models

class Product(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    brand = models.CharField(max_length=100)
    stock_quantity = models.IntegerField(default=0)
    sku = models.CharField(max_length=50, unique=True)
    availability = models.BooleanField(default=True)
    shipping_weight = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_dimensions = models.CharField(max_length=100)
    discounts = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    # You may need to define separate models for images, attributes, reviews, etc.
    # This example assumes that these are separate models related to the Product model.

    def __str__(self):
        return self.title

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Image(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='product_images')

class Attribute(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=100)

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    review_text = models.TextField()
    rating = models.IntegerField()
    # Additional fields as needed

class RelatedProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='related_products')
    related_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='related_to')
