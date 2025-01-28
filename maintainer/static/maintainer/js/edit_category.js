document.addEventListener('DOMContentLoaded', function() {
    const successMessage = document.querySelector('.alert-success')

    if (successMessage) {
        setTimeout(function() {
            window.location.href = '/maintainer/categories/'
        }, 3000)
    }
})
