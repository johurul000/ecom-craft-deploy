from typing import Any
from django.shortcuts import render, redirect
from django.views import View
from django.views.generic import TemplateView, ListView, CreateView, UpdateView, DeleteView
from django.views.generic.edit import CreateView
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login, logout
from customer.models import *
from products.models import *
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.urls import reverse_lazy
from .forms import ProductForm
from django.contrib import messages
from django.db.models import ProtectedError

# Create your views here.


def maintainer_required(view_func):
    
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.is_maintainer:
            return view_func(request, *args, **kwargs)
        
        else:
            return redirect('maintainer_login')
    
    return wrapper

class MaintainerLoginView(View):
    template_name = 'maintainer/maintainer_login.html'
    success_url = 'maintainer_dashboard'

    def get(self, request):
        return render(request, self.template_name)
    
    def post(self, request):
        email = request.POST['email']
        password = request.POST['password']

        user = authenticate(request, email=email, password=password)
        if user is not None:
            if user.is_maintainer:
                login(request, user)
                return redirect(self.success_url)
            else:
                context = {
                'email': email,
                'message' : 'You are not authorized to login as a maintainer.'
            }
            return render(request, self.template_name, context)

        else:
            context = {
                'email': email,
                'message' : 'Invalid Email or Password'
            }
            return render(request, self.template_name, context)
        

class MaintainerLogOutView(View):

    def get(slef, request):
        logout(request)
        return redirect('maintainer_login')
        


@method_decorator(maintainer_required, name='dispatch')
class MainatinerDashboardView(View):
    def get(self, request):
        customer_count = CustomUser.objects.exclude(is_superuser=True).exclude(is_superuser=True).exclude(is_maintainer=True).count()
        product_count = Product.objects.count()
        catagory_count = Category.objects.count()
        pending_order_count = Order.objects.exclude(is_shipped=True).count()

        context = {
            'customer_count': customer_count,
            'product_count': product_count,
            'catagory_count': catagory_count,
            'pending_order_count': pending_order_count
        }

        return render(request, 'maintainer/maintainer_dashboard.html', context)
    

@method_decorator(maintainer_required, name='dispatch')
class ManageOrdersView(View):
    def get(self, request):
        pending_order_items = OrderItem.objects.filter(is_shipped=False, is_delivered=False)
        shipped_order_items = OrderItem.objects.filter(is_shipped=True, is_delivered=False)

        context = {
            'pending_order_items': pending_order_items,
            'shipped_order_items': shipped_order_items
        }

        return render(request, 'maintainer/orders.html', context)
    

class OrderItemDetailsView(View):
    def get(self, request, order_item_id):
        order_item = get_object_or_404(OrderItem, id=order_item_id)
        delivery_address = order_item.order.delivery_address

        data = {
            'order_id': order_item.order.order_id,
            'product_name': order_item.product.product_name,
            'quantity': order_item.quantity,
            'price': order_item.product.price,
            'is_shipped': order_item.is_shipped,
            'name': delivery_address.name,
            'phone_number': delivery_address.phone_number,
            'street': delivery_address.street,
            'house_number': delivery_address.house_number,
            'city': delivery_address.city,
            'state': delivery_address.state,
            'zip_code': delivery_address.postcode,
            'country': str(delivery_address.country)
        }

        print(order_item.order.order_id)
        print(delivery_address)

        return JsonResponse(data)
    

class ShipOrderItemView(View):
    def post(self, request, order_item_id):
       try:
           order_item = OrderItem.objects.get(id=order_item_id)
           order_item.is_shipped = True
           order_item.save()
           return JsonResponse({'message': 'Order item shipped successfully'})
       except OrderItem.DoesNotExist:
           return JsonResponse({'message': 'Order item does not exist'}, status=404)
       

class EditOrderItemView(View):
    template_name = 'maintainer/edit_order.html'
    def get(self, request, order_item_id):
        order_item = get_object_or_404(OrderItem, id=order_item_id)

        return render(request, self.template_name, {'order_item': order_item})
    
    def post(self, request, order_item_id):

        order_item = get_object_or_404(OrderItem, id=order_item_id)
        order_item.quantity = request.POST['quantity']
        order_item.is_shipped = 'is_shipped' in request.POST
        order_item.is_delivered = 'is_delivered' in request.POST
        order_item.is_cancelled = 'is_cancelled' in request.POST
        order_item.save()
        return redirect('manage_orders')


@method_decorator(maintainer_required, name='dispatch')
class ManageProductsView(TemplateView):

    template_name = 'maintainer/product_list.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['in_stock_products'] = Product.objects.filter(stock_quantity__gt=0)
        context['out_of_stock_products'] = Product.objects.filter(stock_quantity__lte=0)
        return context
    

@method_decorator(maintainer_required, name='dispatch')
class AddProductView(View):
    template_name = 'maintainer/add_product.html'


    def get(self, request):
        form = ProductForm()
        categories = Category.objects.all()
        return render(request, self.template_name, {'form': form, 'categories': categories})
    
    def post(self, request):
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('product_list')
        categories = Category.objects.all()
        return render(request, self.template_name, {'form': form, 'categories': categories})
    
@method_decorator(maintainer_required, name='dispatch')
class EditProductView(View):
    template_name = 'maintainer/edit_product.html'

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        categories = Category.objects.all()
        return render(request, self.template_name, {'product': product, 'categories': categories})
    
    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            return redirect('product_list')
        categories = Category.objects.all()
        return render(request, self.template_name, {'form': form, 'product': product, 'categories': categories})
    

class ProductDeleteView(View):
    def delete(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        product.delete()
        return JsonResponse({'success': True})



@method_decorator(maintainer_required, name='dispatch')
class CategoryListView(ListView):
    model = Category
    template_name = 'maintainer/categories.html'
    context_object_name = 'categories'
    catagories = Category.objects.all()

    def get_queryset(self):
        queryset = Category.objects.all()
        # Print primary keys
        for category in queryset:
            print(category.pk)
        return queryset
    

@method_decorator(maintainer_required, name='dispatch')
class AddCategoryView(View):
    def get(self, request):
        categories = Category.objects.all()
        return render(request, 'maintainer/add_category.html', {'categories': categories})

    def post(self, request):
        name = request.POST.get('name')
        description = request.POST.get('description')
        parent_id = request.POST.get('parent')
        parent = Category.objects.get(id=parent_id) if parent_id else None

        try:
            category = Category.objects.create(name=name, description=description, parent=parent)
            messages.success(request, 'Category added successfully.')
            return redirect('categories_list')
        except Exception as e:
            messages.error(request, f'Error adding category: {e}')
            categories = Category.objects.all()
            return render(request, 'maintainer/add_category.html', {'categories': categories})
        

@method_decorator(maintainer_required, name='dispatch') 
class EditCategoryView(UpdateView):
    model = Category
    template_name = 'maintainer/edit_category.html'
    fields = ['name', 'description', 'parent']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.exclude(id=self.object.id)
        return context

    def form_valid(self, form):
        try:
            form.save()
            messages.success(self.request, 'Category updated successfully.')
            
            return redirect('category_list')
        except Exception as e:
            messages.error(self.request, f'Error updating category: {e}')
            return self.render_to_response(self.get_context_data(form=form))

    def get_object(self, queryset=None):
        return get_object_or_404(Category, id=self.kwargs['category_id'])
    



class DeleteCategoryView(View):
    def get(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        try:
            category.delete()
            messages.success(request, "Category deleted successfully.")
        except ProtectedError:
            messages.error(request, "Cannot delete category. There are related products or items.")
        return redirect('categories_list')
    

@method_decorator(maintainer_required, name='dispatch') 
class MemberListView(View):
    def get(self, request):
        customers = CustomUser.objects.filter(is_maintainer=False, is_superuser=False)
        maintainers = CustomUser.objects.filter(is_maintainer=True)
        return render(request, 'maintainer/member_list.html', {
            'customers': customers,
            'maintainers': maintainers
        })
    
@method_decorator(maintainer_required, name='dispatch') 
class AddMemberView(View):
    def get(self, request):
        context = {
            'full_name': '',
            'email': '',
            'username': '',
            'phone_number': '',
            'date_of_birth': '',
            'is_maintainer': False
        }
        return render(request, 'maintainer/add_member.html', context)
    
    def post(self, request):
        full_name = request.POST.get('full_name')
        email = request.POST.get('email')
        username = request.POST.get('username')
        phone_number = request.POST.get('phone_number')
        date_of_birth = request.POST.get('date_of_birth')
        is_maintainer = 'is_maintainer' in request.POST

        default_password = 'DefaultPassword123' 

        if not date_of_birth:
            date_of_birth = None

        context = {
            'full_name': full_name,
            'email': email,
            'username': username,
            'phone_number': phone_number,
            'date_of_birth': date_of_birth,
            'is_maintainer': is_maintainer
        }

        if CustomUser.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken. Please choose another.')
            return render(request, 'maintainer/add_member.html', context, status=400)

        if CustomUser.objects.filter(email=email).exists():
            messages.error(request, 'Email already taken. Please use another.')
            return render(request, 'maintainer/add_member.html', context, status=400)


        try:
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=default_password,
                full_name=full_name,
                phone_number=phone_number,
                date_of_birth=date_of_birth,
                is_maintainer=is_maintainer
            )
            messages.success(request, 'Member added successfully with default password.')
            return redirect('member_list')  
        except Exception as e:
            messages.error(request, f'Error adding member: {e}')
            return render(request, 'maintainer/add_member.html', status=400)


@method_decorator(maintainer_required, name='dispatch') 
class EditMemberView(View):
    def get(self, request, member_id):
        try:
            member = CustomUser.objects.get(id=member_id)
            context = {
                'member': member
            }
            return render(request, 'maintainer/edit_member.html', context)
        except CustomUser.DoesNotExist:
            messages.error(request, 'Member not found.')
            return redirect('member_list')
        
    
    def post(self, request, member_id):
        try:
            member = CustomUser.objects.get(id=member_id)
            full_name = request.POST.get('full_name')
            email = request.POST.get('email')
            username = request.POST.get('username')
            phone_number = request.POST.get('phone_number')
            date_of_birth = request.POST.get('date_of_birth')
            is_maintainer = 'is_maintainer' in request.POST

            if not date_of_birth:
                date_of_birth = None

            # Update member information
            member.full_name = full_name
            member.email = email
            member.username = username
            member.phone_number = phone_number
            member.date_of_birth = date_of_birth
            member.is_maintainer = is_maintainer

            if CustomUser.objects.filter(username=username).exclude(id=member_id).exists():
                messages.error(request, 'Username already taken. Please choose another.')
                return render(request, 'maintainer/edit_member.html', {'member': member}, status=400)

            if CustomUser.objects.filter(email=email).exclude(id=member_id).exists():
                messages.error(request, 'Email already taken. Please use another.')
                return render(request, 'maintainer/edit_member.html', {'member': member}, status=400)

            member.save()
            messages.success(request, 'Member details updated successfully.')
            return redirect('member_list')

        except CustomUser.DoesNotExist:
            messages.error(request, 'Member not found.')
            return redirect('member_list')
        except Exception as e:
            messages.error(request, f'Error updating member: {e}')
            return render(request, 'maintainer/edit_member.html', {'member': member}, status=400)
        



def check_username(request):
    username = request.GET.get('value', '')
    is_available = not CustomUser.objects.filter(username=username).exists()
    return JsonResponse({'available': is_available})

def check_email(request):
    email = request.GET.get('value', '')
    is_available = not CustomUser.objects.filter(email=email).exists()
    return JsonResponse({'available': is_available})



    


    


