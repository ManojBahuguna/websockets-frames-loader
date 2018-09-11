const pwdInput = document.getElementById('pwdInput');
const submitBtn = document.getElementById('submitBtn');
const response = document.getElementById('response');
const alertEl = document.getElementById('alert');
const loginModal = document.getElementById('loginModal');

const setAlert = (msg = '', isError) => {
  response.innerText = msg;
  if (isError) {
    alertEl.classList.remove('alert-success');
    alertEl.classList.add('alert-danger');
  } else {
    alertEl.classList.remove('alert-danger');
    alertEl.classList.add('alert-success');
  }
  alertEl.classList.add('show');
  document.body.appendChild(alertEl);
  loginModal.click();
  pwdInput.value = '';
}

submitBtn.addEventListener('click', async () => {
  const { value } = pwdInput;
  const body = JSON.stringify({ password: value });
  try {
    const res = await (await fetch('/login', {
      method: 'POST', body, headers: {
        "Content-Type": "application/json",
      }
    })).json();
    if (res && res.success) {
      setAlert('Success!');
    } else {
      throw res && new Error(res.message);
    }
  } catch (err) {
    console.error(err);
    setAlert(err.message, true);
  }
});