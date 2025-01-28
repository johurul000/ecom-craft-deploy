document.addEventListener('DOMContentLoaded', function(){


    var addAddressModel = document.getElementById('addAddressModel')

    var addAddressBtn = document.getElementById('addAddressBtn')

    var closeBtn = document.getElementsByClassName('close')[0]
    var addressCheckboxes = document.querySelectorAll('input[name="address_checkbox"]')


    addAddressBtn.onclick = function () {
        addAddressModel.style.display = 'block'
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

                //  Hiding the add address popup form and adding the new address at the end
                // addAddressModel.style.display = 'none'
                // this.reset()


                // const addressList = document.getElementById('address_list')
                // const newAddressHTML = `
                //     <div 
                //         class="address"
                //         data-id="${data.address.id}"
                //         data-name="${data.address.name}"
                //         data-phone="${data.address.phone_number}"
                //         data-nousenumber="${data.address.house_number}"
                //         data-street=" ${data.address.street}"
                //         data-city="${data.address.city}"
                //         data-state="${data.address.state}"
                //         data-postcode="${data.address.postcode}"
                //         data-country="${data.address.country}"
                //         data-isdefault="${data.address.is_default}"
                //     >
                //         <div class="address_details">
                //             <input type="checkbox" name="address_checkbox" value="${data.address.id}" ${data.address.is_default ? 'checked' : ''}>
                //             <p>
                //                 <span>${data.address.name}</span>, ${data.address.phone_number}, ${data.address.street}, ${data.address.city}, ${data.address.state}, ${data.address.postcode}, ${data.address.country}
                //             </p>
                //         </div>
                        
                //     </div>
                // `

                // addressList.insertAdjacentHTML('beforeend', newAddressHTML)
                // attachEventListners(addressCheckboxes)

                // const noAddressMessage = document.getElementById('no_address_message')
                // if (noAddressMessage){
                //     noAddressMessage.remove()
                // }
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
    const changeAddress = document.getElementById('change_address')
    const selectedAddress = document.getElementById('selected_address')
    const addressSection = document.getElementById('address_section')
    const addressHeading = document.getElementById('address_heading')


    // Applying a class called 'chosen_address' to the checked checkbox

    addressCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.closest('.address').classList.add('chosen_address');
        }
    })

    attachEventListners(addressCheckboxes)

    function attachEventListners(addressCheckboxes){
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
    }

    // Checkbox consistancy (When one checkbox is clicked The others are simultaneously unclicked)

    

    // Chang Address functionality

    changeAddress.addEventListener('click', function(){
        addressSection.style.display = 'flex'
        selectedAddress.style.display = 'none'

        addressHeading.innerText = 'Select Delivery Address'
    })

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

                addressSection.style.display = 'none'
                selectedAddress.style.display = 'flex'

                const selectedAddressParagraph = document.getElementById('selected_address_paragraph')

                const selectedAddressParagraphHTML = `
                    <p>
                        <span>${data.address.name}</span>, ${data.address.phone_number}, ${data.address.street}, ${data.address.city}, ${data.address.state}, ${data.address.postcode}, ${data.address.country}
                    </p>
                `
                selectedAddressParagraph.innerHTML = selectedAddressParagraphHTML

                addressHeading.innerText = 'Delivery Address'



            }else {
                alert('failed to set default address')
            }
        })
        .catch(error => {
            console.error('Error setting default Address:', error)
        })
    }


    







})

    


