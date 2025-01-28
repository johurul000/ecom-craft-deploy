from django import forms
from .models import CustomUser, DeliveryAddress
from django_countries.fields import CountryField
from django_countries.widgets import CountrySelectWidget


class DeliveryAddressForm(forms.ModelForm):
    class Meta:
        model = DeliveryAddress
        fields = ['name', 'phone_number', 'house_number', 'street', 'city', 'state', 'country', 'postcode', 'is_default']
        widgets = {
            'country': CountrySelectWidget(attrs={'class': 'form-control'}),
            'state': forms.TextInput(attrs={'class': 'form-control'})
        }

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            prefix = kwargs.get('prefix', '')
            # self.prefix = prefix
            for field_name in self.fields:
                self.fields[field_name].widget.attrs['id'] = f"{prefix}_{field_name}"

        # def __init__(self, *args, **kwargs):
        #     prefix = kwargs.pop('prefix', '')
        #     super().__init__(*args, **kwargs)
        #     self.prefix = prefix

        # def id_for_label(self, id_):
        #     if self.prefix:
        #         return f'id_{self.prefix}_{id_}'.replace('-', '_')
        #     return super().id_for_label(id_)
