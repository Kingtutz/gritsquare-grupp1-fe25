document.addEventListener('DOMContentLoaded', function() {
  const popup = document.getElementById('termsPopup');
  const acceptBtn = document.getElementById('acceptBtn');
  const declineBtn = document.getElementById('declineBtn');
  const agreeCheckbox = document.getElementById('agreeCheckbox');

  
  popup.style.display = 'flex';

  // Enable accept button only if checkbox is checked
  agreeCheckbox.addEventListener('change', function() {
    acceptBtn.disabled = !this.checked;
  });

  
  acceptBtn.addEventListener('click', function() {
    popup.style.display = 'none';
  });

  
  declineBtn.addEventListener('click', function() {
    window.location.href = 'https://www.google.com';
  });
});