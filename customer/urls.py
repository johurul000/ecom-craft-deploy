from django.urls import path
from .views import *
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogOutView.as_view(), name='logout'),
    path('shop/', ShopView.as_view(), name='shop'),
    path('product/<int:id>', ProductView.as_view(), name='product_details'),
    path('add-to-cart-ajax/', AddCartShopAjax.as_view(), name='add-to-cart-ajax'),


    path('cart/', CartItemListView.as_view(), name='cart'),
    path('delete-cart-item/', CartItemDeleteView.as_view(), name='delete-cart-item'),
    path('update-cartitem-quantity/', CartItemUpdateView.as_view(), name='update-cartitem-quantity'),
    path('fetch-products-details/', FetchProductsDetailsView.as_view(), name='fetch-products-details'),

    path('checkout/', CheckOutView.as_view(), name='checkout'),
    path('add-address/', AddAddressView.as_view(), name='add-address'),
    path('set-default-address/<int:address_id>', SetDefaultAddressView.as_view(), name='set-default-address'),
    path('edit-address/<int:address_id>', EditAddressView.as_view(), name='edit-address'),
    path('delete-address/<int:address_id>', DeleteAddressView.as_view(), name='delete-address'),
    path('success/', OrderSuccessView.as_view(), name='success'),

    path('orders/', OrderListView.as_view(), name='orders'),
    path('customer-info/', CustomerInfoView.as_view(), name='customer-info'),


    # CUSTOMER INFO CRUD
    path('add-full-name/', AddFullNameView.as_view(), name='add_full_name'),
    path('edit-full-name/', EditFullName.as_view(), name='edit_full_name'),
    path('edit-user-email/', EditUserEmail.as_view(), name='edit_user_email'),
    path('add-user-phone/', AddUserPhoneView.as_view(), name='add_user_phone'),
    path('edit-user-phone/', EditUserPhone.as_view(), name='edit_user_phone'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),


    path('addresses/', ListAddressView.as_view(), name='addresses'),
    path('your-account/', AccountView.as_view(), name='your_account'),

    path('customer-info-page-auth/', CustomerInfoPageAuth.as_view(), name='customer_info_page_auth'),

    path('password-reset/', ResetPasswordView.as_view(), name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(template_name='customer/password_reset_confirm.html'),
         name='password_reset_confirm'),
    path('password-reset-complete/',
         auth_views.PasswordResetCompleteView.as_view(template_name='customer/password_reset_complete.html'),
         name='password_reset_complete'),

     path('demo-login/', DemoLoginView.as_view(), name='demo_login'),
]

