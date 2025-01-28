document.addEventListener('DOMContentLoaded', function () {

    const addToCartButtons = document.querySelectorAll('.add_to_cart_btn')
    const isAuthenticatedString = document.getElementById('is_authenticated').value

    const userIsAuthenticated = isAuthenticatedString === 'true'
    console.log(userIsAuthenticated)

    addToCartButtons.forEach(button => (
        button.addEventListener('click', () => {
            const productId = button.dataset.productId
            const productPrice = button.dataset.productPrice
            console.log(productPrice)
            console.log('Trying to log product id')

            if (userIsAuthenticated) {
                addToCartAjax(productId)
            } else {
                ensureCartExists()
                updateCartInLocalStorage(productId, productPrice)
                updateCartDom()
            }
        })
    ))

    function addToCartAjax(productId) {
        const csrfToken = document.getElementById('add_to_cart_form').querySelector('input[name="csrfmiddlewaretoken"]').value
        const numsProductId = parseInt(productId, 10)

        fetch('/add-to-cart-ajax/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ 'product_id': numsProductId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Item Added To cart: ', data)
            const contCartElement = document.getElementById('cart_btn')
            contCartElement.textContent = `Cart (${data['item_count']})`
        })
        .catch(error => {
            console.log("Error Adding to cart: ", error)
        });
    }

    function ensureCartExists() {
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]))
        }
    }


    function updateCartInLocalStorage(productId, productPriceString) {
        let cart = JSON.parse(localStorage.getItem('cart')) || []
        const existingItem = cart.find(item => item.productId === productId)
        if (existingItem) {
            existingItem.quantity += 1
        } else {
            const productPrice = parseFloat(productPriceString)
            cart.push({ productId: productId, quantity: 1, price: productPrice })
        }
        localStorage.setItem('cart', JSON.stringify(cart))
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