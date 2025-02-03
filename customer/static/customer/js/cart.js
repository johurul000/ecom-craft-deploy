


document.addEventListener('DOMContentLoaded', function () {


    const csrfToken = document.querySelector('meta[name="csrf-token"]').content

    const isAuthenticatedString = document.getElementById('is_authenticated').value

    console.log(isAuthenticatedString)


    const userIsAuthenticated = isAuthenticatedString === 'true'

    console.log(userIsAuthenticated)



    // Delete Item

    function deleteCartItem(cartItemId){

        console.log(userIsAuthenticated)

        if (userIsAuthenticated) { 
            console.log()
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
                    
        
                    const cartCount = document.getElementById('cart_btn')
                    if(cartCount) {
                        cartCount.textContent = `Cart (${data.item_count})`
                    }
                    const cartSubtotal = document.getElementById('cart_subtotal')
                    if (cartSubtotal) {
                        cartSubtotal.textContent = `$ ${data.cart_subtotal}`
                    }
                    const cartitemDiv = document.getElementById(`cart_item_${cartItemId}`)
                    if (cartitemDiv){
                        cartitemDiv.remove()
                    }
                    else{
                        console.log('cartItemDiv Variable Undefined')
                    }
                    
                } else {
                    console.error('Error deleting cart Item:', data.error)
                }
        
            })
            .catch(error => {
                console.error('Error deleting cart item:', error)
            })
        } else {
            
            let cart = JSON.parse(localStorage.getItem('cart') || [])
            cart = cart.filter(item => item.productId !== cartItemId.toString())
            localStorage.setItem('cart', JSON.stringify(cart))

            const cartItemDiv = document.getElementById(`cart_item_${cartItemId}`)
            if (cartItemDiv) {
                cartItemDiv.remove()
            }

            updateCartDom()
        }
        
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

        if (userIsAuthenticated){
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
                console.log('Quantity Updated: ', data)
    
                const cartSubtotal = document.getElementById('cart_subtotal')
                if (cartSubtotal) {
                    cartSubtotal.textContent = `$ ${data.cart_subtotal}`
                }
    
                quantityField.value = data.quantity
            })
            .catch(error => {
                console.log('Error Updating Quantity: ', error)
            })

        }else {

            let cart = JSON.parse(localStorage.getItem('cart') || [])
            const cartItem = cart.find(item => item.productId === cartItemId.toString())

            if (cartItem){
                cartItem.quantity = quantity

                localStorage.setItem('cart', JSON.stringify(cart))

                quantityField.value = quantity

                let cartSubtotal = 0
                cart.forEach(item => {
                    
                    cartSubtotal += item.price * item.quantity
                })

                const cartSubtotalElement = document.getElementById('cart_subtotal');
                if (cartSubtotalElement) {
                    cartSubtotalElement.textContent = `₹ ${cartSubtotal}`;
                }

                updateCartDom()
            }
            


        }

        
    }



    if (!userIsAuthenticated) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        if (cart.length > 0) {
            const emptyCartMessage = document.getElementById('empty_cart_message');
            if (emptyCartMessage) {
                emptyCartMessage.style.display = 'none';
            }

            const checkoutSection = document.getElementById('checkout_section');
            if (checkoutSection) {
                checkoutSection.style.display = 'block';
            }

            let cartSubtotal = 0;
            const productIds = cart.map(item => item.productId);

            fetch('/fetch-products-details/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ 'product_ids': productIds })
            })
            .then(response => response.json())
            .then(data => {
                data.products.forEach(product => {
                    
                    
                    const cartMap = new Map(cart.map(item => [item.productId, item]));
                    const cartItem = cartMap.get(String(product.id));
                    cartSubtotal += product.price * cartItem.quantity;
                    addToCartDom(product, cartItem.quantity);
                });

                // Update subtotal in the DOM itself
                const cartSubtotalElement = document.getElementById('cart_subtotal');
                if (cartSubtotalElement) {
                    cartSubtotalElement.textContent = `₹ ${cartSubtotal}`;
                }
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
            });
        }
    }

    
    function addToCartDom(product, quantity) {
        const cartItemsContainer = document.getElementById('cart_items_container');
        
        // Create cart item element
        const cartItemHtml = `
            <div class="cart_item" id="cart_item_${product.id}">
                <div>
                    <img src="${product.product_image_url}" alt="">
                </div>
                <div class="item_details">
                    <h3>${product.product_name}</h3>
                    <div class="item_price">
                        <h4>Price: ₹ ${product.price}</h4>
                    </div>
                    <div class="item_btns">
                        <button class="cart_item_delete_btn" data-cartitem-id="${product.id}">Delete</button>
                        <div class="quantity_btns">
                            <button id="decrease_btn_${product.id}">-</button>
                            <input 
                                class="quantity_field" 
                                type="number" 
                                name="" 
                                id="quantity_field_${product.id}" 
                                data-cartitem-id="${product.id}" 
                                min="1" 
                                value="${quantity}" 
                                readonly
                            >
                            <button id="increase_btn_${product.id}">+</button>
                        </div>
                    </div>
                </div>
            </div>`;
        
        cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHtml);

        attachEventListenersToNewItem(product.id);
    }

    function attachEventListenersToNewItem(cartItemId) {
        const decreaseBtn = document.getElementById(`decrease_btn_${cartItemId}`);
        const increaseBtn = document.getElementById(`increase_btn_${cartItemId}`);
        const deleteBtn = document.querySelector(`button[data-cartitem-id="${cartItemId}"]`);

        decreaseBtn.addEventListener('click', () => handleQuantityChange(cartItemId, -1));
        increaseBtn.addEventListener('click', () => handleQuantityChange(cartItemId, 1));
        deleteBtn.addEventListener('click', () => deleteCartItem(cartItemId));
    }


    function updateCartDom() {
        let cart = JSON.parse(localStorage.getItem('cart')) || []
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
        const contCartElement = document.getElementById('cart_btn');
        contCartElement.textContent = `Cart (${itemCount})`;
    }

    if (!userIsAuthenticated) {
        updateCartDom()
    }
    
})
