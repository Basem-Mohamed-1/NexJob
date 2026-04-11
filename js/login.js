var Btn = document.getElementById("loginBtn");
Btn.disabled = true;

    var loginUsername = document.getElementById("login-username");
    var loginPassword = document.getElementById("login-password");
    
    loginUsername.oninput = checkInputs;
    loginPassword.oninput = checkInputs;

    function checkInputs ()
    {
        if (loginUsername.value != "" && loginPassword.value != "")
            {
                Btn.disabled = false;
            }
        else 
            {
                Btn.disabled = true;
            }    
    }

function loginSubmitFunction(event)
{
    event.preventDefault();

    var users = JSON.parse(localStorage.getItem("users")) || [];

    var found = users.find( user => user.username == loginUsername.value && user.password == loginPassword.value);

    if (found)
        {
            console.log("Welcome back, " + found.username);
            if (found.type == "admin")
                {
                    
                    window.location.href = "../company/Dashboard.html";
                    return;
                }
            else 
                {
                    window.location.href = "../jobseeker/home.html";
                    return;
                }    
        }
    else 
        {
            document.getElementsByClassName("passwordp")[0].innerHTML = "Invalid username or password";
            return;
        }

}