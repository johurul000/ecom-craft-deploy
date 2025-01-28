from django import forms
from products.models import Product, Category

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            'product_name', 'description', 'price', 'category', 'brand', 
            'stock_quantity', 'sku', 'availability', 'shipping_weight', 
            'shipping_dimensions', 'discounts', 'product_image'
        ]
