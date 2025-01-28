$(document).ready(function() {
    if ($('#messageModal').length) {
        $('#messageModal').modal('show');
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.btn-danger');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const confirmation = confirm('Are you sure you want to delete this category?');
            
            if (!confirmation) {
                event.preventDefault();
            }
        });
    });
});
