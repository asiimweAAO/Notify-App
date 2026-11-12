const form = document.getElementById('loginForm');
const errorBox = document.getElementById('loginError');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('studentEmail').value;
  const password = document.getElementById('password').value;

  // Look the email up in the STUDENT_ACCOUNTS array (accounts.js)
  const account = findAccount(email);

  if (account && account.password === password) {
    // Save ONLY the email. Never store the password in the session.
    sessionStorage.setItem('notify_student', JSON.stringify({ email: account.email }));
    window.location.href = 'student-dashboard.html';
  } else {
    errorBox.classList.remove('d-none');
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
  }
});
