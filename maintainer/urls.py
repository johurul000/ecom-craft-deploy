from django.urls import path
from .views import *

urlpatterns = [
    path('login/', MaintainerLoginView.as_view(), name='maintainer_login'),
    path('logout/', MaintainerLogOutView.as_view(), name='maintainer_logout'),
    path('', MainatinerDashboardView.as_view(), name='maintainer_dashboard'),

    path('orders/', ManageOrdersView.as_view(), name='manage_orders'),
    path('order-item-details/<int:order_item_id>/', OrderItemDetailsView.as_view(), name='order_item_details'),
    path('ship-order-item/<int:order_item_id>/', ShipOrderItemView.as_view(), name='ship_order_item'),
    path('edit-order-item/<int:order_item_id>/', EditOrderItemView.as_view(), name='edit_order_item'),

    path('products/', ManageProductsView.as_view(), name='product_list'),
    path('add-product/', AddProductView.as_view(), name='add_product'),
    path('edit-product/<int:pk>/', EditProductView.as_view(), name='edit_product'),
    path('delete-product/<int:product_id>/', ProductDeleteView.as_view(), name='delete_product'),

    path('categories/', CategoryListView.as_view(), name='categories_list'),
    path('categories/add/', AddCategoryView.as_view(), name='add_category'),
    path('categories/edit/<int:category_id>/', EditCategoryView.as_view(), name='edit_category'),
    path('categories/delete/<int:pk>/', DeleteCategoryView.as_view(), name='delete_category'),

    path('members/', MemberListView.as_view(), name='member_list'),
    path('members/add/', AddMemberView.as_view(), name='add_member'),
    path('edit-member/<int:member_id>/', EditMemberView.as_view(), name='edit_member'),
    path('check-username/', check_username, name='check_username'),
    path('check-email/', check_email, name='check_email'),
    
]