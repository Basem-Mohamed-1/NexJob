var Btn = document.getElementById("loginBtn");
Btn.disabled = true;

var loginUsername = document.getElementById("login-username");
var loginPassword = document.getElementById("login-password");

loginUsername.oninput = checkInputs;
loginPassword.oninput = checkInputs;

function checkInputs() {
  document.getElementsByClassName("passwordp")[0].innerHTML = "";
  if (loginUsername.value != "" && loginPassword.value != "") {
    Btn.disabled = false;
  } else {
    Btn.disabled = true;
  }
}

function loginSubmitFunction(event) {
  event.preventDefault();

  showLoader();

  setTimeout(() => {
    var users = JSON.parse(localStorage.getItem("users")) || [];

    var found = users.find(
      (user) =>
        user.username === loginUsername.value &&
        user.password === loginPassword.value,
    );

    hideLoader();

    if (found) {
      localStorage.setItem("currentUser", JSON.stringify(found));
      showToast("Welcome back, " + found.username + "!", "success");

      setTimeout(() => {
        if (found.type == "admin") {
          window.location.href = "../company/Dashboard.html";
        } else {
          window.location.href = "../jobseeker/home.html";
        }
      }, 1000);
    } else {
      document.getElementsByClassName("passwordp")[0].innerHTML =
        "Invalid username or password";
      showToast("Invalid username or password", "error");
    }
  }, 800);
}
