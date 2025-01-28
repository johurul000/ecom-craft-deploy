document.addEventListener('DOMContentLoaded', function () {

    const isAuthenticatedString = document.getElementById('is_authenticated').value

    const userIsAuthenticated = isAuthenticatedString === 'true'


    function ensureCartExists() {
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]))
        }
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