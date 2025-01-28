const csrfToken = document.querySelector('meta[name="csrf-token"]').content

// Get the modals
var addNameModal = document.getElementById('addNameModel')
var editNameModal = document.getElementById('editNameModel')
var editEmailModal = document.getElementById('editEmailModel')
var addPhoneModel = document.getElementById('addPhoneModel')
var editPhoneModal = document.getElementById('editPhoneModel')
var changePasswordModel = document.getElementById('changePasswordModel')


// Get the buttons
var addNameBtn = document.getElementById('add_name')
var editNameBtn = document.getElementById('edit_name')
var editEmailBtn = document.getElementById('edit_email')
var addPhoneBtn = document.getElementById('add_phone')
var editPhoneBtn = document.getElementById('edit_phone')
var changePasswordBtn = document.getElementById('change_password')

// Get the close buttons
var closeBtns = document.querySelectorAll('.close');

// Function to open modal
function openModal(modal) {
    modal.style.display = 'block';
}

// Function to close modal
function closeModal(modal) {
    modal.style.display = 'none';
}

// Event listeners for buttons
if (addNameBtn){
    addNameBtn.addEventListener('click', function() {
        openModal(addNameModal)
        const addNameForm = document.getElementById('addNameForm')
        const fullNameInput = addNameForm.querySelector('input[name="full_name"]')

        addNameForm.addEventListener('submit', (event) => {
            event.preventDefault()

            const fullName = fullNameInput.value

            fetch('/add-full-name/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({full_name: fullName})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    
                    window.location.reload()
                    closeModal(addNameModal)
                } else {
                    console.error('Failed to add name');
                }
            })
            .catch(error => {
                console.error('Error adding name:', error);
            })
        })
    });
}


if (editNameBtn) {
    editNameBtn.addEventListener('click', function() {
        console.log('Edit Model')
        openModal(editNameModal)
        const fullName = editNameBtn.dataset.name
        const editNameForm = document.getElementById('editNameForm')
        const fullNameInput = editNameForm.querySelector('input[name="full_name"]')
        fullNameInput.value = fullName
    
        editNameForm.addEventListener('submit', (event) => {
            event.preventDefault()
            const updatedFullName = fullNameInput.value
            console.log(updatedFullName)
    
            fetch('/edit-full-name/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({'full_name': updatedFullName})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    
                    window.location.reload()
                    closeModal(editNameModal)
                } else {
                    console.error('Failed to update Name');
                }
            })
            .catch(error => {
                console.error('Error updating name:', error);
            })
        })
    });
}


editEmailBtn.addEventListener('click', function() {
    openModal(editEmailModal);
    const email = editEmailBtn.dataset.email
    const editEmailForm = document.getElementById('editEmailForm')
    const emailInput = editEmailForm.querySelector('input[name="email"]')
    emailInput.value = email

    editEmailForm.addEventListener('submit', (event) => {
        event.preventDefault()

        const updatedEmail = emailInput.value
        console.log(updatedEmail)

        fetch('/edit-user-email/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({'email': updatedEmail })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {

                
                window.location.reload()
                closeModal(editEmailModal)
            } else {
                console.error('Failed to update Email');
            }
        })
        .catch(error => {
            console.error('Error updating email:', error);
        })

    })

});

if (addPhoneBtn){
    addPhoneBtn.addEventListener('click', function(){
        openModal(addPhoneModel)
        const addPhoneForm = document.getElementById('addPhoneForm')
        const phoneInput = addPhoneForm.querySelector('input[name="phone_number"]')

        addPhoneForm.addEventListener('submit', (event) => {
            event.preventDefault()

            const  newNumber = phoneInput.value

            fetch('/add-user-phone/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({phone_number: newNumber })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
    
                    
                    window.location.reload()
                    closeModal(addPhoneModel)
                } else {
                    console.error('Failed to Add Phone');
                }
            })
            .catch(error => {
                console.error('Error adding phone:', error);
            })

        })
    })
}


if (editPhoneBtn){
    editPhoneBtn.addEventListener('click', function() {
        openModal(editPhoneModal);
        const phoneNumber = editPhoneBtn.dataset.phone
        const editPhoneForm = document.getElementById('editPhoneForm')
        const phoneInput = editPhoneForm.querySelector('input[name="phone_number"]')
        phoneInput.value = phoneNumber
    
        editPhoneForm.addEventListener('submit', (event) => {
            event.preventDefault()
            const updatedPhone = phoneInput.value
    
            fetch('/edit-user-phone/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({'phone_number': updatedPhone })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
    
                    
                    window.location.reload()
                    closeModal(editPhoneModal)
                } else {
                    console.error('Failed to update Phone');
                }
            })
            .catch(error => {
                console.error('Error updating phone:', error);
            })
            
        })
    });
}


changePasswordBtn.addEventListener('click', function(){
    openModal(changePasswordModel)
    const changePasswordForm = document.getElementById('changePasswordForm')
    const oldPassInput = changePasswordForm.querySelector('input[name="old_password"]')
    const newPassInput = changePasswordForm.querySelector('input[name="new_password"]')
    const confirmPassInput = changePasswordForm.querySelector('input[name="confirm_password"]')

    changePasswordForm.addEventListener('submit', (event) => {
        event.preventDefault()

        const oldPass = oldPassInput.value
        const newPass = newPassInput.value
        const confirmPass = confirmPassInput.value

        if (newPass !== confirmPass){
            alert('New password and confirm password doesnot match')
            return
        }

        fetch('/change-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                old_password: oldPass,
                new_password: newPass
            })
        })
        .then(response => {
            if(response.ok){
                closeModal(changePasswordModel)
                alert('password changed successfully')
                window.location.reload()
            }else if (response.status === 401){
                alert('Incorect old password')
            } else {
                alert('Failed to change password')
            }
        })
        .catch(error => {
            console.error('Error changing password', error)
            alert('An error occured while changing password')
        })


    })

})

// Event listeners for close buttons
closeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        var modal = this.parentElement.parentElement;
        closeModal(modal);
    });
});

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target == editNameModal ||
        event.target == editEmailModal ||
        event.target == editPhoneModal) {
        closeModal(event.target);
    }
});


