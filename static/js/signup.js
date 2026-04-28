// CHOOSE THE USER TYPE BUTTON --------------------------

var form    = document.querySelector('.form1');
var seeker    = document.querySelector('.job-seeker');
var admin    = document.querySelector('.admin');


seeker.classList.add("job-seeker");

var Btn = document.getElementById("seekersubmitButton");

Btn.disabled = true;

var type = "seeker"; 

seeker.onclick = function () {
            document.getElementById("admin-signup-companyname").classList.add("hidden");
            document.querySelector("label[for='admin-signup-companyname']").classList.add("hidden");

            admin.classList.remove("admin-selected");
            seeker.classList.add("job-seeker-selected");

            type = "seeker";

            // RESET THE STRENGTH BAR
            document.getElementsByClassName("filledBar")[0].style.width = "0%";
            document.getElementsByClassName("filledBar")[0].style.backgroundColor = "";
            document.getElementsByClassName("strengthText")[0].innerHTML = "";

            // CLEARES THE VALIDATION MASSAGES IN ADMIN FORM 
            form.querySelectorAll('p').forEach( function(p) {p.innerHTML = "";} );

            // CLEARES THE FORM IF YOU PRESSED THE BUTTON

            form.reset();

            // DISABLE BUTTON INCASE OF CHANGING THE FORM THAT I SUBMITTING IN

            Btn.disabled = true;
}

admin.onclick = function () {
            document.getElementById("admin-signup-companyname").classList.remove("hidden");
            document.querySelector("label[for='admin-signup-companyname']").classList.remove("hidden");

            seeker.classList.remove("job-seeker-selected");
            admin.classList.add("admin-selected");

            type = "admin";

            // RESET THE STRENGTH BAR
            document.getElementsByClassName("filledBar")[0].style.width = "0%";
            document.getElementsByClassName("filledBar")[0].style.backgroundColor = "";
            document.getElementsByClassName("strengthText")[0].innerHTML = "";

            // CLEARES THE VALIDATION MASSAGES IN ADMIN FORM 
            form.querySelectorAll('p').forEach( function(p) {p.innerHTML = "";} );

            // CLEARES THE FORM IF YOU PRESSED THE BUTTON

            form.reset();

            // DISABLE BUTTON INCASE OF CHANGING THE FORM THAT I SUBMITTING IN
            
            Btn.disabled = true;
}

// ------------------------------------------------------

// INPUT LISTENERS --------------------------

var Username = document.getElementById("signup-username");
var Email    = document.getElementById("signup-email");
var Password = document.getElementById("signup-password");
var Confirm  = document.getElementById("signup-confirm");
var company  = document.getElementById("admin-signup-companyname");

Username.oninput = checkInputs;
Email.oninput    = checkInputs;
Confirm.oninput  = checkInputs;
company.oninput  = checkInputs;
Password.addEventListener('input', checkInputs);
Password.addEventListener('input', checkstrength);

function checkInputs() {
    if (type == "seeker") 
    {
        if (Username.value != "" && Email.value != "" && Password.value != "" && Confirm.value != "") 
        {
            Btn.disabled = false;
        } 
        else 
        {
            Btn.disabled = true;
        }
    }
    else if (type == "admin") {
        if (Username.value != "" && Email.value != "" && Password.value != "" && Confirm.value != "" && company.value != "") 
        {
            Btn.disabled = false;
        }
        else
        {
            Btn.disabled = true;
        }
    }
}

// --------------------------------------------------------------


function checkstrength()
{
    var strength = 0;
    var val  = Password.value;
    var fill = document.getElementsByClassName("filledBar")[0];
    var text = document.getElementsByClassName("strengthText")[0];
    

    if (val.length >= 8) strength++;
    if (/[a-z]/.test(val)) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;

    if (val == "")
        {
            fill.style.width = "0%"
            fill.style.backgroundColor = "";
            text.innerHTML = "";
        }
        else if (strength == 1)
        {
            fill.style.width = "20%"
            fill.style.backgroundColor = "#A50126";
            text.style.color = "#A50126"
            text.innerHTML = "Too weak";
        }
       else if (strength == 2)
        {   
            fill.style.width = "40%"
            fill.style.backgroundColor = "#D73026";
            text.style.color = "#D73026"
            text.innerHTML = "Weak";
        }
       else if (strength == 3)
        {
            fill.style.width = "60%"
            fill.style.backgroundColor = "#D9EF8B";
            text.style.color = "#D9EF8B"
            text.innerHTML = "Moderate";
        }
       else if (strength == 4)
        {
            fill.style.width = "80%"
            fill.style.backgroundColor = "#66BD64";
            text.style.color = "#66BD64"
            text.innerHTML = "Good";
        }
        else if (strength == 5)
        {
            fill.style.width = "100%"
            fill.style.backgroundColor = "#006837";
            text.style.color = "#006837"
            text.innerHTML = "Great";
        }
    return strength;
}


// SUBMIT FUNCTION ---------------------------------------------------------------------------------

function signupSubmitFunction(event) {
    event.preventDefault();

    // DECLARING WHICH MASSAGE ARE WE DEALING WITH WE ARE USING INDEX HERE BECUASE THE PARAGRAPHS IN THE 2 FORM HAS THE SAME CLASSES

        let usernameMSG        = document.getElementsByClassName("usernamep")[0];
        let emailMSG           = document.getElementsByClassName("emailp")[0];
        let passwordMSG        = document.getElementsByClassName("passp")[0];
        let confirmpasswordMSG = document.getElementsByClassName("confirmpassp")[0];

    
    // VLAIDATION ---------------------------------------------------------------------------------

    // USERNAME VALIDATION ---------------------------------------------------------------------------------


    if (Username.value == "")
        {
            usernameMSG.innerHTML = "You must write a username"
            return;
        }
    else if(Username.value.length < 4) 
        {
            usernameMSG.innerHTML = "Username must be at least 4 characters"
            return;
        }

        
        // CHEACKING IF THE USERNAME IS DUBLICATE

        // ARRAY OF USERS TO STORE THE USERS IN AND IF IT IS EMPTY JUST MAKE AN EMPTY ONE 
        var users = JSON.parse(localStorage.getItem("users")) || [];

        var duplicate = users.find(user => user.username == Username.value);
        if (duplicate) {
            usernameMSG.innerHTML = "Username already taken";
            return;
        }
        
        usernameMSG.innerHTML = "";           


    // PASSWORD VALIDATION ---------------------------------------------------------------------------------

        var currentStrength = checkstrength();

    if (Password.value == "")
        {
            passwordMSG.innerHTML = "You must write a password"
            return;
        }
    else if (Password.value.length < 8)
        {
            passwordMSG.innerHTML ="Password must be at least 8 characters";
            return
        }
    else if (currentStrength < 3) 
        {
            passwordMSG.innerHTML ="Password is weak";
            return;
        }
    else 
        {
            passwordMSG.innerHTML ="";
        }

    // CONFIRM PASSWORD VALIDATION ---------------------------------------------------------------------------------

    if (Password.value != Confirm.value)
        {
            confirmpasswordMSG.innerHTML = "Passwords do not match";
            return;
        }
    else 
        {
            confirmpasswordMSG.innerHTML = "";
        }

    
        // THE LOCAL STORAGE FOR THE SIGN UP ---------------------------------------------------------------------------------

        // ADDING NEW USER
        users.push({
            username: Username.value,
            email:    Email.value,
            password: Password.value,
            type:     type,
            company:  type == "admin" ? company.value : null
        });

// SAVING THE UPDATES
        localStorage.setItem("users", JSON.stringify(users));
  
        showToast("Account created successfully! Please login.", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
}