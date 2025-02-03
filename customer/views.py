from django.db.models.query import QuerySet
from django.shortcuts import get_object_or_404, render, redirect
from django.views import View
from django.views.generic import ListView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from .models import *
from products.models import Product
from django.http import JsonResponse
from .forms import DeliveryAddressForm
import json
import razorpay
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
import json
from django.db.models import Sum
from django.contrib.auth.views import PasswordResetView
from django.contrib.messages.views import SuccessMessageMixin
from django.urls import reverse_lazy
from django.core.cache import cache
from django.contrib import messages


# Create your views here.

class SignUpView(View):
    template_name = 'customer/signup.html'
    success_url = '/login'

    def get(self, request):
        return render(request, self.template_name)
    

    def post(self, request):
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        password02 = request.POST['password02']

        if CustomUser.objects.filter(username=username).exists():
            context = {
                'email' :  email, 
                'password' : password,
                'message': "Username already exists."
            }
        elif CustomUser.objects.filter(email=email).exists():
            context = {
                'username' :  username, 
                'password' : password,
                'message': "Email already exists."
            }
        elif password != password02:
            context = {
                'email' :  email, 
                'username' : username,
                'message': "Passwords does not match."
            }
        else:
            my_user = CustomUser.objects.create_user(email=email, username=username, password=password)
            my_user.save()
            return redirect(self.success_url)
        
        return render(request, self.template_name, context)
    


class  LoginView(View):
    template_name = 'customer/login.html'
    success_url = '/'

    def get(self, request):
        return render(request, self.template_name)
    
    def post(self, request):
        email = request.POST['email']
        password = request.POST['password']

        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            self.sync_cart_data(request)
            next_url = request.POST.get('next', self.success_url)
            return redirect(next_url)
        else:
            context = {
                'email': email,
                'message' : 'Invalid Email or Password'
            }
            return render(request, self.template_name, context)
        
    def sync_cart_data(self, request):
        
        cart_data = json.loads(request.POST.get('cart_data', '[]'))
        user = request.user

        cart, created = Cart.objects.get_or_create(user=user)

        for item in cart_data:

            product_id = item['productId']
            quantity = item['quantity']

            try:
                product = Product.objects.get(id=product_id)

                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    product=product,
                    defaults={'quantity': quantity}
                )

                if not created:
                    cart_item.quantity = quantity
                    cart_item.save()

            except Product.DoesNotExist:
                continue



        
class LogOutView(View):

    def get(slef, request):
        logout(request)
        return redirect('login')
        

class HomeView(View):
    template_name = 'customer/home.html'

    def get(self, request):
        user = request.user
        item_count = 0  
        
        if user.is_authenticated:
            try:
                cart = Cart.objects.get(user=user)
                item_count = cart.cartitem_set.count()
            except Cart.DoesNotExist:
                item_count = 0  
        context = {
            'user': user,
            'item_count': item_count
        }

        return render(request, self.template_name, context)

    

class ResetPasswordView(SuccessMessageMixin, PasswordResetView):
    template_name = 'customer/password_reset.html'
    email_template_name = 'customer/password_reset_email.html'
    subject_template_name = 'customer/password_reset_subject'
    success_message = "We've emailed you instructions for setting your password, " \
                      "if an account exists with the email you entered. You should receive them shortly." \
                      " If you don't receive an email, " \
                      "please make sure you've entered the address you registered with, and check your spam folder."
    success_url = reverse_lazy('home')
    
class ShopView(View):
    def get(self, request):
        user = request.user

        products = Product.objects.all()

        if user.is_authenticated:
            cart = Cart.objects.filter(user=user).first()
            if not cart:
                cart = Cart.objects.create(user=user)

            item_count = cart.cartitem_set.aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0
        else:
            item_count = 0  

        context = {
            'products': products,
            'item_count': item_count,
            'user_is_authenticated': user.is_authenticated,
        }
        return render(request, 'customer/shop.html', context)
    
class ProductView(View):
    template_name = 'customer/product.html'

    def get(self, request, id):
        user = request.user

        if user.is_authenticated:
            cart = Cart.objects.filter(user=user).first()
            item_count = cart.cartitem_set.aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0
        else:
            item_count = 0

        product = Product.objects.get(id=id)

        context = {
            'product': product,
            'item_count': item_count,
            'user_is_authenticated': user.is_authenticated,
        }
        return render(request, self.template_name, context) 
    

    
class AddCartShopAjax(View):

    def post(self, request):
        if request.user.is_authenticated:

            user = request.user

            try:
                data = json.loads(request.body)
                product_id = data.get('product_id')
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid Json Data'}, status=400)
            print(product_id)
            print(type(product_id))

            try:
                print('Product id to integer')
                product = Product.objects.get(id = product_id)
            except Product.DoesNotExist:
                return JsonResponse({'error': 'Invalid Product Id'}, status=400)
            
            cart, created = Cart.objects.get_or_create(user=request.user)

            existing_item = CartItem.objects.filter(cart=cart, product=product).first()

            if existing_item:
                existing_item.quantity += 1
                existing_item.save()
                message = 'Product Quantity Updated'
            else:
                new_item = CartItem.objects.create(cart=cart, product=product)
                message = 'Product Added to cart'

            cart.refresh_from_db()
            item_count = cart.cartitem_set.aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0

            response_data = {
                'message': message,
                'item_count': item_count,
                

            }

            return JsonResponse(response_data)
        else:
            return JsonResponse({'error': 'User is not authenticated'}, status=401)
        

class CartItemListView(View):
    model = CartItem
    template_name = 'customer/cart.html'

    def get(self, request):

        user = request.user

        if user.is_authenticated:
            cart = Cart.objects.get(user=self.request.user)
            cart_items = cart.cartitem_set.all()
            item_count = cart.cartitem_set.aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0


            cart_subtotal = sum(item.subtotal() for item in cart_items)
        else:
            cart_items = None
            item_count = 0
            cart_subtotal = 0


        print(user.is_authenticated)

        context = {
            'cart_items': cart_items,
            'item_count': item_count,
            'cart_subtotal': cart_subtotal,
            'user_is_authenticated': user.is_authenticated,
        }

        return render(request, self.template_name, context)
    
class FetchProductsDetailsView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            product_ids = data.get('product_ids', [])
            
            products = Product.objects.filter(id__in=product_ids)
            
            products_data = [
                {
                    'id': product.id,
                    'product_name': product.product_name,
                    'price': product.price,
                    'product_image_url': product.product_image.url,
                }
                for product in products
            ]
            
            return JsonResponse({'products': products_data})
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    def get(self, request, *args, **kwargs):
        return JsonResponse({'error': 'Invalid request'}, status=400)
    

class CartItemDeleteView(View):

    def post(self, request):
        if request.user.is_authenticated:
            try:
                data = json.loads(request.body)
                cart_item_id = data.get('cart_item_id')
                cart_item = CartItem.objects.get(id=cart_item_id)
                cart_item.delete()
                cart = Cart.objects.get(user=request.user)
                cart_items = cart.cartitem_set.all()


                cart.refresh_from_db()
                item_count = cart.cartitem_set.aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0

                cart_subtotal = sum(item.subtotal() for item in cart_items)

                return JsonResponse({'success': True, 'item_count': item_count, 'cart_subtotal': cart_subtotal})
            except CartItem.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Cart Item Not Found'})
        else:
            return JsonResponse({'error': 'User is not authenticated'}, status=401)
        


class CartItemUpdateView(View):

    def post(self, request):
        try:
            data = json.loads(request.body)
            cart_item_id = data.get('cart_item_id')
            quantity = data.get('quantity')
            cart_item = CartItem.objects.get(id=cart_item_id)
            cart_item.quantity = quantity
            cart_item.save()

            cart = Cart.objects.get(user=request.user)
            cart_items = cart.cartitem_set.all()
            cart_subtotal = sum(item.subtotal() for item in cart_items)


            return JsonResponse({'success': True, 'quantity': cart_item.quantity, 'cart_subtotal': cart_subtotal})
        except (CartItem.DoesNotExist, ValueError):
            return JsonResponse({'success': False, 'error': 'Invalid Data'})
        


@method_decorator(login_required, name='dispatch')
class CheckOutView(View):
    def get(self, request):
        form = DeliveryAddressForm()
        try:
            addresses = DeliveryAddress.objects.filter(user=request.user)
            default_address = DeliveryAddress.objects.get(user=request.user, is_default=True)
        except ObjectDoesNotExist:
            addresses = []
            default_address = None
        
        edit_form = DeliveryAddressForm(prefix='edit')
        product_id = request.GET.get('product_id')
        cart_items = []
        cart_subtotal = 0
        
        if product_id:
            single_product = get_object_or_404(Product, id=product_id)
            cart_subtotal = float(single_product.price)
            cart_items = [{'product': single_product, 'quantity': 1, 'subtotal': cart_subtotal}]
            item_count = 1 
        else:
            cart = Cart.objects.get(user=request.user)
            cart_items = cart.cartitem_set.all()
            cart_subtotal = float(sum(item.subtotal() for item in cart_items))
            item_count = cart.cartitem_set.aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0
        
        if cart_subtotal < 1:
            cart_subtotal = 1.00
        
        cached_order = cache.get(f'razorpay_order_{request.user.id}')
        if cached_order:
            payment = cached_order
        else:
            try:
                client = razorpay.Client(auth=(settings.KEY, settings.SECRET))
                data = {"amount": int(cart_subtotal * 100), "currency": "INR", 'payment_capture': 1}
                payment = client.order.create(data=data)

                if not product_id:
                    cart.razor_pay_order_id = payment['id']
                    cart.save()

                cache.set(f'razorpay_order_{request.user.id}', payment, timeout=300)
            except razorpay.errors.BadRequestError:
                messages.error(request, "Too many payment requests. Please try again after a few minutes.")
                return redirect('checkout')  
        context = {
            'form': form, 
            'edit_form': edit_form, 
            'addresses': addresses,
            'cart_items': cart_items,
            'cart_subtotal': cart_subtotal,
            'default_address': default_address,
            'payment': payment if 'payment' in locals() else None,
            'is_single_product': bool(product_id),
            'single_product': single_product if product_id else None,
            'item_count': item_count

        }
        
        return render(request, 'customer/checkout.html', context)

    

@method_decorator(login_required, name='dispatch')
class OrderSuccessView(View):
    def get(self, request):
        payment_id = request.GET.get('razorpay_payment_id')
        order_id = request.GET.get('razorpay_order_id')
        payment_signature = request.GET.get('razorpay_signature')
        
        cart = Cart.objects.filter(razor_pay_order_id=order_id).first()
        product_id = request.GET.get('product_id')
        
        if product_id:
            single_product = get_object_or_404(Product, id=product_id)
            cart_items = [{'product': single_product, 'quantity': 1, 'subtotal': single_product.price}]
            order_total_price = single_product.price
            order_total_quantity = 1
        else:
            cart_items = cart.cartitem_set.all()
            order_total_price = sum(item.subtotal() for item in cart_items)
            order_total_quantity = sum(item.quantity for item in cart_items)
        
        delivery_address = DeliveryAddress.objects.filter(user=request.user, is_default=True).first()
        
        order = Order.objects.create(
            user=request.user,
            order_id=order_id,
            payment_id=payment_id,
            payment_signature=payment_signature,
            order_total_price=order_total_price,
            order_total_quantity=order_total_quantity,
            payment_mode='razorpay',
            delivery_address=delivery_address
        )
        
        if product_id:
            
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    quantity=item['quantity']
                )
        else:
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity
                )
            

        
        if cart:
            cart.cartitem_set.all().delete()
        
        context = {'order': order}
        return render(request, 'customer/order_success.html', context)






class AddAddressView(View):

    def post(self, request):
        form = DeliveryAddressForm(request.POST)
        if form.is_valid():
            address = form.save(commit=False)
            address.user = request.user
            existing_addresses = DeliveryAddress.objects.filter(user=request.user)
            
            if not existing_addresses.exists() or address.is_default:
                address.is_default = True
                existing_addresses.update(is_default=False)

            address.save()




            address_data = {
                'id': address.id,
                'name': address.name,
                'phone_number': address.phone_number,
                'street': address.street,
                'city': address.city,
                'state': address.state,
                'postcode': address.postcode,
                'country': address.get_country_display(),
                'is_default': address.is_default,
            }

            return JsonResponse({'success': True, 'address': address_data})
        else:
            print(form.errors)
            return JsonResponse({'success': False, 'errors': form.errors})
        

class SetDefaultAddressView(View):
    
    def post(self, request, address_id):
        try:
            address = DeliveryAddress.objects.get(user=self.request.user, id=address_id)
            address.is_default = True
            address.save()

            DeliveryAddress.objects.filter(user=self.request.user).exclude(id=address_id).update(is_default=False)
            address_data = {
                'id': address.id,
                'name': address.name,
                'phone_number': address.phone_number,
                'street': address.street,
                'city': address.city,
                'state': address.state,
                'postcode': address.postcode,
                'country': address.get_country_display(),
                'is_default': address.is_default,
            }
            return JsonResponse({'success': True, 'address': address_data})
        except DeliveryAddress.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Address does not Exist'})
        
class EditAddressView(View):
    def post(self, request, address_id):
        data = json.loads(request.body.decode('utf-8'))
        form = DeliveryAddressForm(data)
        
        if form.is_valid():
            address = DeliveryAddress.objects.get(id=address_id)
            address.name = form.cleaned_data['name']
            address.phone_number = form.cleaned_data['phone_number']
            address.house_number = form.cleaned_data['house_number']
            address.street = form.cleaned_data['street']
            address.city = form.cleaned_data['city']
            address.state = form.cleaned_data['state']
            address.country = form.cleaned_data['country']
            address.postcode = form.cleaned_data['postcode']
            # address.is_default = form.cleaned_data['is_default']
            address.save()
            return JsonResponse({'success': True})
        else:
            print(form.errors)
            return JsonResponse({'success': False, 'errors': form.errors})
        

class DeleteAddressView(View):
    def post(self, request, address_id):
        try:
            address = DeliveryAddress.objects.get(id=address_id)
            address.delete()
            return JsonResponse({'success':True})
        except DeliveryAddress.DoesNotExist:
            return JsonResponse({'success':False,'error':'Address Does Not Exists'}, status=404)
        
@method_decorator(login_required, name='dispatch')
class OrderListView(View):
    def get(self, request):
        

        order_items = OrderItem.objects.filter(order__user=request.user)
        

        cart = Cart.objects.get(user=self.request.user)
        item_count = cart.cartitem_set.count()


        context = {
            'order_items': order_items,
            'item_count': item_count
        }

        return render(request, 'customer/orderpage.html', context)
    


class CustomerInfoView(View):
    def get(self, request):
        user = request.user
        cart = Cart.objects.get(user=self.request.user)
        item_count = cart.cartitem_set.count()

        context = {
            'user': user,
            'item_count': item_count
        }

        return render(request, 'customer/customer_info.html', context)
    

class AddFullNameView(View):
    def post(self, request):
        data = json.loads(request.body)
        full_name = data.get('full_name')
        print(full_name)
        if full_name:
            user = request.user
            user.full_name = full_name
            user.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'Full name is required'})
    
class EditFullName(View):
    def post(self, request):
        data = json.loads(request.body)
        full_name = data.get('full_name')
        print(full_name)
        if full_name:
            user = request.user
            user.full_name = full_name
            user.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'Full name is required'})
        

class EditUserEmail(View):
    def post(self, request):
        data = json.loads(request.body)
        try:
            email = data.get('email')

            if not email:
                raise ValueError('Email address is required')
            

            if CustomUser.objects.exclude(pk=request.user.pk).filter(email=email).exists():
                raise ValueError('Email address is already in use')

            user = request.user
            user.email = email
            user.save()

            update_session_auth_hash(request, user)

            return JsonResponse({'success': True})
        except (ValueError, ValidationError) as e:
            return JsonResponse({'success': False, 'error': str(e)})

class AddUserPhoneView(View):
    def post(self, request):
        data = json.loads(request.body)
        phone_number = data.get('phone_number')
        if phone_number:
            user = request.user
            user.phone_number = phone_number
            user.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'Phone number is required'})
        
class EditUserPhone(View):
    def post(self, request):
        data = json.loads(request.body)
        phone_number = data.get('phone_number')
        if phone_number:
            user = request.user
            user.phone_number = phone_number
            user.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'Phone number is required'})
        

class ChangePasswordView(View):
    def post(self, request):
        data = json.loads(request.body)
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        print(old_password, new_password, request.user.email)

        
        user = authenticate(request, email=request.user.email, password=old_password)
        if user is None:

            return JsonResponse({'success': False, 'error': 'Incorrect old password'}, status=401)
        

        user.set_password(new_password)
        user.save()

        login(request, user)

        return JsonResponse({'success': True})
    
    def get(self, request):
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    


class ListAddressView(View):
    def get(self, request):
        user = request.user
        cart = Cart.objects.get(user=self.request.user)
        item_count = cart.cartitem_set.count()
        form = DeliveryAddressForm()
        addresses = DeliveryAddress.objects.filter(user=self.request.user)
        default_address = DeliveryAddress.objects.get(user=self.request.user, is_default=True)

        edit_form = DeliveryAddressForm(prefix='edit')
        del edit_form.fields['is_default']

        context = {
            'addresses': addresses,
            'default_address': default_address,
            'form': form,
            'edit_form': edit_form,
            'item_count': item_count

        }
        
        return render(request, 'customer/addresses.html', context)
    

class AccountView(View):
    def get(self, request):
        user = request.user
        cart = Cart.objects.get(user=self.request.user)
        item_count = cart.cartitem_set.count()

        context = {
            'user': user,
            'item_count': item_count
        }
        return render(request, 'customer/profile.html', context)

class CustomerInfoPageAuth(View):

    def post(self, request):
        data = json.loads(request.body)
        password = data.get('password')

        
        user = authenticate(request, email=request.user.email, password=password)
        if user is None:

            return JsonResponse({'success': False, 'error': 'Incorrect password'}, status=401)
        

        return JsonResponse({'success': True})
    
    def get(self, request):
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    



class DemoLoginView(View):
    template_name = 'customer/demo_login.html'

    def get(self, request):
        return render(request, self.template_name)


        






