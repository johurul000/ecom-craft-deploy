

const csrfToken = document.querySelector('meta[name="csrf-token"]').content
var orderDiv = document.getElementById('order_div')
var securityDiv = document.getElementById('security_div')
var addressDiv = document.getElementById('address_div')
const mainURL = `http://127.0.0.1:8000/`




orderDiv.addEventListener('click', function(){
    window.location.href = `${mainURL}orders/`
})

addressDiv.addEventListener('click', function(){
    window.location.href = `${mainURL}addresses/`
})


var checkPasswordModel = document.getElementById('checkPasswordModel')
var closeBtns = document.querySelectorAll('.close')

securityDiv.addEventListener('click', function(){
    checkPasswordModel.style.display = 'flex'

    const checkPasswordForm = document.getElementById('checkPasswordForm')
    const passwordInput = checkPasswordForm.querySelector('input[name="password"]')

    checkPasswordForm.addEventListener('submit', (event) => {
        event.preventDefault()

        const password = passwordInput.value

        fetch('/customer-info-page-auth/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({password: password})
        })
        .then(response => {
            if(response.ok){
                alert('Authentication successful')
                window.location.href = `${mainURL}customer-info/`
            }else if (response.status === 401){
                alert('Incorect password')
            } else {
                alert('Failed to Authenticat')
            }
        })
        .catch(error => {
            console.error('Error changing password', error)
            alert('An error occured while authenticating')
        })
    })
})



closeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        var modal = this.parentElement.parentElement;
        modal.style.display = 'none'
    });
});

window.addEventListener('click', function(event) {
    if (event.target == checkPasswordModel) {
        event.target.style.display = 'none'
    }
});
