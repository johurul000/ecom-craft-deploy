
// functionality for menu dropdown
function toggleDropdown() {
    const userAccountDiv = document.querySelector('.user_account');
    
    userAccountDiv.classList.toggle('show-dropdown');
}
const dropdown = document.querySelector('.dropdown_menu');

window.onclick = function(event) {
    if (!event.target.matches('.user_account, .user_account *')) {
        const dropdown = document.querySelector('.dropdown_menu');
        if (dropdown && dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        }
    }
};


