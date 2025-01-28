// document.addEventListener('DOMContentLoaded', function() {
//     const usernameInput = document.querySelector('#username');
//     const emailInput = document.querySelector('#email');

//     async function checkAvailability(field, value) {
//         try {
//             const response = await fetch(`/check-${field}/?value=${encodeURIComponent(value)}`);
//             const result = await response.json();
//             return result.available;
//         } catch (error) {
//             console.error('Error checking availability:', error);
//             return false;
//         }
//     }

//     usernameInput.addEventListener('blur', async function() {
//         const isAvailable = await checkAvailability('username', usernameInput.value);
//         if (!isAvailable) {
//             alert('Username already taken. Please choose another.');
//         }
//     });

//     emailInput.addEventListener('blur', async function() {
//         const isAvailable = await checkAvailability('email', emailInput.value);
//         if (!isAvailable) {
//             alert('Email already taken. Please use another.');
//         }
//     });
// });
