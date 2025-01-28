function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

document.addEventListener('DOMContentLoaded', function() {
    


    function showOrderItemDetails(orderItemId){
        fetch(`/maintainer/order-item-details/${orderItemId}/`)
        .then(response => response.json())
        .then(data => {
            const detailsContent = document.getElementById('order-item-details-content')
            detailsContent.innerHTML = `
                <h2>Order Item Details</h2>
                <div class="order-details">
                    <p><strong>Order ID:</strong> ${data.order_id}</p>
                    <p><strong>Product Name:</strong> ${data.product_name}</p>
                    <p><strong>Quantity:</strong> ${data.quantity}</p>
                    <p><strong>Price:</strong> ₹ ${data.price}</p>
                    <p><strong>Shipping Status:</strong> ${data.is_shipped ? 'Shipped' : 'Pending'}</p>
                    <p><strong>Delivery Address:</strong></p>
                    <div class="address-details">
                        <p><strong>Name:</strong> ${data.name}</p>
                        <p><strong>Phone Number:</strong> ${data.phone_number}</p>
                        <p><strong>Street:</strong> ${data.street}</p>
                        <p><strong>House Number:</strong> ${data.house_number}</p>
                        <p><strong>City:</strong> ${data.city}</p>
                        <p><strong>State:</strong> ${data.state}</p>
                        <p><strong>Zip Code:</strong> ${data.zip_code}</p>
                        <p><strong>Country:</strong> ${data.country}</p>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-edit-order-button">Edit</button>
                        ${data.is_shipped ? '<button disabled>Shipped</button>' : '<button class="modal-ship-button" data-order-item-id="${orderItemId}">Ship</button>'} 
                    </div>
                </div>
            `
            document.getElementById('order-item-details-modal').style.display = 'block'

            const shipButton = detailsContent.querySelector('.modal-ship-button');
            if (shipButton) {
                shipButton.addEventListener('click', () => {
                    shipOrderItem(orderItemId)
                })
            }

            const editButton = detailsContent.querySelector('.modal-edit-order-button');
            if (editButton) {
                editButton.addEventListener('click', () => {
                    window.location.href = `/maintainer/edit-order-item/${orderItemId}`
                })
            }
            
        })
    }

    function shipOrderItem(orderItemId) {
        fetch(`/maintainer/ship-order-item/${orderItemId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
        })
        .then(response => {
            if(response.ok) {
                alert('Order item shipped successfully!')
                document.getElementById('order-item-details-modal').style.display = 'none'
                window.location.reload()
            }else{
                alert('Failed to ship order item!')
            }
        })
    
    }

    document.querySelectorAll('.details-button').forEach(button => {
        button.addEventListener('click', function() {
            const orderItemId = this.dataset.orderItemId
            showOrderItemDetails(orderItemId)
        })
    })

    const editButtons = document.querySelectorAll('.edit-order-button')
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderItemId = this.dataset.orderItemId
            window.location.href = `/maintainer/edit-order-item/${orderItemId}`
        })
    })

    document.querySelectorAll('.ship-order-button').forEach(button => {
        button.addEventListener('click', function(){
            const orderItemId = this.dataset.orderItemId
            shipOrderItem(orderItemId)
        })
    })



    document.querySelector('.modal .close').addEventListener('click', function() {
        document.getElementById('order-item-details-modal').style.display = 'none'
    })


    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
})


