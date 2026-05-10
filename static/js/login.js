var Btn = document.getElementById("loginBtn");
Btn.disabled = true;

var loginUsername = document.getElementById("login-username");
var loginPassword = document.getElementById("login-password");

loginUsername.oninput = checkInputs;
loginPassword.oninput = checkInputs;

function checkInputs() {
  if (loginUsername.value != "" && loginPassword.value != "") {
    Btn.disabled = false;
  } else {
    Btn.disabled = true;
  }
}

function loginSubmitFunction(event) {
  event.preventDefault();

  let passwordMSG = document.getElementsByClassName("passwordp")[0];

  passwordMSG.innerHTML = "";

  if (loginUsername.value.trim() == "") {
    passwordMSG.innerHTML = "Username is required";
    return;
  }

  if (loginPassword.value.trim() == "") {
    passwordMSG.innerHTML = "Password is required";
    return;
  }

  document.getElementById("login-form").submit();
}
