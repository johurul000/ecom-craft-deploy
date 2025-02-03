document.addEventListener('DOMContentLoaded', function () {

    const isAuthenticatedString = document.getElementById('is_authenticated').value

    const userIsAuthenticated = isAuthenticatedString === 'true'

    console.log(userIsAuthenticated)

    const addToCartButton = document.querySelector('.add_to_cart_btn')

    addToCartButton.addEventListener('click', () => {
        const productId = addToCartButton.dataset.productId
        const productPrice = addToCartButton.dataset.productPrice


            if (userIsAuthenticated) {
                addToCartAjax(productId)
            } else {
                ensureCartExists()
                updateCartInLocalStorage(productId, productPrice)
                updateCartDom()
            }
    })


    function addToCartAjax(productId) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
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
            const contCartElement = document.getElementById('cart_btn')
            contCartElement.textContent = `Cart (${data['item_count']})`
            alert('Item Added to cart')
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

    const buyNowButtons = document.getElementById("buy_now_btn")
    buyNowButtons.addEventListener("click", function () {
        const productId = this.getAttribute("data-product-id");
        window.location.href = `/checkout/?product_id=${productId}`;
    });



})