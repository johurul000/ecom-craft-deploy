
let sidebarOpen = false;
const sidebar = document.getElementById('sidebar');

function openSidebar() {
  if (!sidebarOpen) {
    sidebar.classList.add('sidebar-responsive');
    sidebarOpen = true;
  }
}

function closeSidebar() {
  if (sidebarOpen) {
    sidebar.classList.remove('sidebar-responsive');
    sidebarOpen = false;
  }
}


function toggleDropdown() {
  // Select the parent user account div
  const userAccountDiv = document.querySelector('.user_account');
  
  // Toggle the 'show-dropdown' class on the user account div
  userAccountDiv.classList.toggle('show-dropdown');
}
const dropdown = document.querySelector('.dropdown_menu');

// Optionally, close dropdown if clicking anywhere outside the dropdown
window.onclick = function(event) {
  if (!event.target.matches('.user_account, .user_account *')) {
      const dropdown = document.querySelector('.dropdown_menu');
      if (dropdown && dropdown.style.display === 'block') {
          dropdown.style.display = 'none';
      }
  }
};
