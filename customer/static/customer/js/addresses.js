document.addEventListener('DOMContentLoaded', function(){ 


    var addAddressModel = document.getElementById('addAddressModel')

    var addAddressBtn = document.getElementById('addAddressBtn')

    var closeBtn = document.getElementsByClassName('close')[0]
    const addAddressForm = document.getElementById('addAddressForm')

    addAddressBtn.onclick = function () {
        addAddressModel.style.display = 'flex'
    }

    closeBtn.onclick = function () {
        addAddressModel.style.display = 'none'
    }

    window.onclick = function (event) {
        if (event.target == addAddressModel){
            addAddressModel.style.display = 'none'
        }
    }


    document.getElementById('addAddressForm').addEventListener('submit', function(event){
        event.preventDefault()
        const formData = new FormData(this)

        fetch('/add-address/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Address Is saved')

                window.location.reload()
            }
            else {
                console.error('Error setting default Address:', error)
            }
        })
        .catch(error => {
            console.error('Error setting default Address:', error)
        })
    })





    const csrfToken = document.querySelector('meta[name="csrf-token"]').content

    var addressCheckboxes = document.querySelectorAll('input[name="address_checkbox"]')
    // const changeAddress = document.getElementById('change_address')
    const selectedAddress = document.getElementById('selected_address')
    const addressSection = document.getElementById('address_section')
    const addressHeading = document.getElementById('address_heading')


    // Applying a class called 'chosen_address' to the checked checkbox

    addressCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.closest('.address').classList.add('chosen_address');
        }
    })

    // Checkbox consistancy (When one checkbox is clicked The others are simultaneously unclicked)

    addressCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(){
            if(this.checked){

                this.closest('.address').classList.add('chosen_address')


                addressCheckboxes.forEach(otherCheckbox => {
                    if(otherCheckbox != this){
                        otherCheckbox.checked = false
                        otherCheckbox.closest('.address').classList.remove('chosen_address')
                    }
                })
            }else {
                otherCheckbox.closest('.address').classList.remove('chosen_address')
            }
        })
    })

    // Chang Address functionality

    // changeAddress.addEventListener('click', function(){
    //     addressSection.style.display = 'flex'
    //     selectedAddress.style.display = 'none'

    //     addressHeading.innerText = 'Select Delivery Address'
    // })

    // Setting the default address to be used

    const useAddressBtn = document.getElementById('use_this_address')

    useAddressBtn.addEventListener('click', function(){
        const selectedAddressId = getSelectedAddressId()
        if (selectedAddressId){
            setDefaultAddress(selectedAddressId)
        }else {
            alert('Please select an address')
        }
    })


    function getSelectedAddressId(){
        for (const checkbox of addressCheckboxes){
            if(checkbox.checked){
                return checkbox.value
            }
        }
    }

    function setDefaultAddress(addressId){
        fetch(`/set-default-address/${addressId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                console.log('Default address updated')

                // Adding the selected address and hiding the other address lists.

                // addressSection.style.display = 'none'
                // selectedAddress.style.display = 'flex'

                // const selectedAddressParagraph = document.getElementById('selected_address_paragraph')

                // const selectedAddressParagraphHTML = `
                //     <input type="checkbox" name="" id="" checked disabled>
                //     <p>
                //         <span>${data.address.name}</span>, ${data.address.phone_number}, ${data.address.street}, ${data.address.city}, ${data.address.state}, ${data.address.postcode}, ${data.address.country}
                //     </p>
                // `
                // selectedAddressParagraph.innerHTML = selectedAddressParagraphHTML

                // addressHeading.innerText = 'Delivery Address'

                window.location.reload()



            }else {
                alert('failed to set default address')
            }
        })
        .catch(error => {
            console.error('Error setting default Address:', error)
        })
    }


    attachEventListners()


    function attachEventListners(){

        const editButtons = document.querySelectorAll('.edit_address_button')
        var editAddressModel = document.getElementById('editAddressModel')

        editButtons.forEach(button => {
            button.addEventListener('click', function(){
            editAddressModel.style.display = 'flex'

            var editCloseBtn = document.getElementById('edit_close')

            editCloseBtn.onclick = function () {
                editAddressModel.style.display = 'none'
            }

            const addressDiv = button.closest('.address');
            const addressId = addressDiv.dataset.id;
            const addressName = addressDiv.dataset.name;
            const addressPhone = addressDiv.dataset.phone;
            const addressHouseno = addressDiv.dataset.nousenumber;
            const addressStreet = addressDiv.dataset.street;
            const addressCity = addressDiv.dataset.city;
            const addressState = addressDiv.dataset.state;
            const addressPostcode = addressDiv.dataset.postcode;
            const addressCountry = addressDiv.dataset.country;
            var addressIsDefault = addressDiv.dataset.isdefault;

            if (addressIsDefault === 'True' || addressIsDefault === 'true') {
                addressIsDefault = true
            } else {
                addressIsDefault = false

            }


            var editAddressForm = document.getElementById('editAddressForm');
            editAddressForm.querySelector('#id_edit-name').value = addressName;
            editAddressForm.querySelector('#id_edit-phone_number').value = addressPhone;
            editAddressForm.querySelector('#id_edit-house_number').value = addressHouseno;
            editAddressForm.querySelector('#id_edit-street').value = addressStreet;
            editAddressForm.querySelector('#id_edit-city').value = addressCity;
            editAddressForm.querySelector('#id_edit-state').value = addressState;
            editAddressForm.querySelector('#id_edit-country').value = addressCountry;
            editAddressForm.querySelector('#id_edit-postcode').value = addressPostcode;
            editAddressForm.querySelector('#id_edit-is_default').checked = addressIsDefault;

            
            editAddressForm.addEventListener('submit', (event) => {
                event.preventDefault()

                var customer_name = editAddressForm.querySelector('#id_edit-name').value
                var phone_number = editAddressForm.querySelector('#id_edit-phone_number').value
                var house_number = editAddressForm.querySelector('#id_edit-house_number').value
                var street = editAddressForm.querySelector('#id_edit-street').value
                var city = editAddressForm.querySelector('#id_edit-city').value
                var state = editAddressForm.querySelector('#id_edit-state').value
                var country = editAddressForm.querySelector('#id_edit-country').value
                var postcode = editAddressForm.querySelector('#id_edit-postcode').value
                var is_default = editAddressForm.querySelector('#id_edit-is_default').checked

                const formData = {
                    name: customer_name ,
                    phone_number: phone_number,
                    house_number: house_number,
                    street: street,
                    city: city,
                    state: state,
                    country: country,
                    postcode:postcode,
                    is_default: is_default
                    
                }

                fetch(`/edit-address/${addressId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify(formData),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {

                        
                        window.location.reload()
                        editAddressModel.style.display = 'none';
                    } else {
                        console.error('Failed to update address');
                    }
                })
                .catch(error => {
                    console.error('Error updating address:', error);
                })
            })
                })
        })


        const deleteButtons = document.querySelectorAll('.delete_address_button')

        deleteButtons.forEach(button => {
            button.addEventListener("click", function(){

                const addressDiv = this.closest('.address')
                const  id = addressDiv.dataset.id

                const confirmDelete = confirm("Are you sure you want to delete this address?")

                if (confirmDelete) {
                    fetch(`/delete-address/${id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success){
                            addressDiv.remove()
                        }else {
                            console.error('Failed to delete address')
                        }
                    })
                    .catch(error => {
                        console.error('Error Deleting Address', error)
                    })
                }

            })
        })

    }





    // Cart Items Functionalites

    function deleteCartItem(cartItemId){
        fetch('/delete-cart-item/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({'cart_item_id': cartItemId})
        })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                // xxx
                window.location.reload()
                
            } else {
                console.error('Error deleting cart Item:', data.error)
            }
    
        })
        .catch(error => {
            console.error('Error deleting cart item:', error)
        })
    }
    
    const cartItemDeleteBtns = document.querySelectorAll('.cart_item_delete_btn')
    
    cartItemDeleteBtns.forEach(button => {
        button.addEventListener('click', () => {
            const cartItemId = button.getAttribute('data-cartitem-id')
            console.log('id:', cartItemId)
            deleteCartItem(cartItemId)
        })
    })
    
    
    // Quantity Changing 
    
    const quantityFields = document.querySelectorAll('.quantity_field')
    
    quantityFields.forEach(field => {
        const cartItemId = field.getAttribute('data-cartitem-id')
        const decreaseBtn = document.getElementById(`decrease_btn_${cartItemId}`)
        const increaseBtn = document.getElementById(`increase_btn_${cartItemId}`)
        console.log('buttons are parsed')
    
        decreaseBtn.addEventListener('click', () => handleQuantityChange(cartItemId, -1))
        increaseBtn.addEventListener('click', () => handleQuantityChange(cartItemId, 1))
    })
    
    
    function handleQuantityChange(cartItemId, change){
        const quantityField = document.getElementById(`quantity_field_${cartItemId}`)
        const quantity = change + parseInt(quantityField.value, 10)
    
        if (quantity < 1){
            deleteCartItem(cartItemId)
            return
        }
    
        fetch('/update-cartitem-quantity/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({'cart_item_id': cartItemId, 'quantity': quantity})
        })
        .then(response => response.json())
        .then(data => {
            window.location.reload()
        })
        .catch(error => {
            console.log('Error Updating Quantity: ', error)
        })
    }
})