
// CHOOSE THE USER TYPE BUTTON --------------------------
var form1    = document.querySelector('.form1');
var form2    = document.querySelector('.form2');
var seeker    = document.querySelector('.job-seeker');
var admin    = document.querySelector('.admin');

form1.style.display ="block";
form2.style.display ="none";
seeker.style.borderColor = "#057be8";
seeker.style.boxShadow= "4px 5px 5px -3px #057ae867";

var seekerBtn = document.getElementById("seekersubmitButton");
var adminBtn = document.getElementById("adminsubmitButton");

seekerBtn.disabled = true;
adminBtn.disabled = true;

var type = "seeker"; 

seeker.onclick = function () {
            admin.style.cssText = '';
            form1.style.display ="block";
            form2.style.display ="none";
            seeker.style.borderColor = "#057be8";
            seeker.style.boxShadow= "4px 5px 5px -3px #057ae867";
            form2.reset();
            type = "seeker";

            // RESET THE STRENGTH BAR
            document.getElementsByClassName("filledBar")[1].style.width = "0%";
            document.getElementsByClassName("filledBar")[1].style.backgroundColor = "";
            document.getElementsByClassName("strengthText")[1].innerHTML = "";

            // CLEARES THE VALIDATION MASSAGES IN ADMIN FORM 
            form2.querySelectorAll('p').forEach( function(p) {p.innerHTML = "";} );

            // DISABLE BUTTON INCASE OF CHANGING THE FORM THAT I SUBMITTING IN

            seekerBtn.disabled = true;
            adminBtn.disabled = true;
}

admin.onclick = function () {
            seeker.style.cssText = '';
            form2.style.display ="block";
            form1.style.display ="none";
            admin.style.borderColor = "#057be8";
            admin.style.boxShadow= "4px 5px 5px -3px #057ae867";
            type = "admin";

            // RESET THE STRENGTH BAR
            document.getElementsByClassName("filledBar")[0].style.width = "0%";
            document.getElementsByClassName("filledBar")[0].style.backgroundColor = "";
            document.getElementsByClassName("strengthText")[0].innerHTML = "";

            // CLEARES THE VALIDATION MASSAGES IN ADMIN FORM 
            form1.querySelectorAll('p').forEach( function(p) {p.innerHTML = "";} );

            // DISABLE BUTTON INCASE OF CHANGING THE FORM THAT I SUBMITTING IN
            form1.reset();
            
            seekerBtn.disabled = true;
            adminBtn.disabled = true;

            var company = document.getElementById("admin-signup-companyname");
            company.oninput = checkInputs;
}

// ------------------------------------------------------

// INPUT LISTENERS --------------------------

var seekerUsername = document.getElementById("signup-username");
var seekerEmail    = document.getElementById("signup-email");
var seekerPassword = document.getElementById("signup-password");
var seekerConfirm  = document.getElementById("signup-confirm");

var adminUsername  = document.getElementById("admin-signup-username");
var adminEmail     = document.getElementById("admin-signup-email");
var adminPassword  = document.getElementById("admin-signup-password");
var adminConfirm   = document.getElementById("admin-signup-confirm");
var company        = document.getElementById("admin-signup-companyname");

seekerUsername.oninput = checkInputs;
seekerEmail.oninput    = checkInputs;
seekerConfirm.oninput  = checkInputs;
seekerPassword.addEventListener('input', checkInputs);
seekerPassword.addEventListener('input', checkstrength);

adminUsername.oninput = checkInputs;
adminEmail.oninput    = checkInputs;
adminConfirm.oninput  = checkInputs;
adminPassword.addEventListener('input', checkInputs);
adminPassword.addEventListener('input', checkstrength);

function checkInputs() {
    if (type == "seeker") 
    {
        if (seekerUsername.value != "" && seekerEmail.value != "" && seekerPassword.value != "" && seekerConfirm.value != "") 
        {
            seekerBtn.disabled = false;
        } 
        else 
        {
            seekerBtn.disabled = true;
        }
    }
    else if (type == "admin") {
        if (adminUsername.value != "" && adminEmail.value != "" && adminPassword.value != "" && adminConfirm.value != "" && company.value != "") 
        {
            adminBtn.disabled = false;
        }
        else
        {
            adminBtn.disabled = true;
        }
    }
}

// --------------------------------------------------------------


function checkstrength()
{
    var strength = 0;
    var val  = (type == "admin") ? adminPassword.value : seekerPassword.value;
    var fill = (type == "admin") ? document.getElementsByClassName("filledBar")[1] : document.getElementsByClassName("filledBar")[0];
    var text = (type == "admin") ? document.getElementsByClassName("strengthText")[1] : document.getElementsByClassName("strengthText")[0];
    

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


// SUBMIT --------------------------
function seekerSubmitFunction(event) {
    event.preventDefault();

    // DECLARING WHICH MASSAGE ARE WE DEALING WITH WE ARE USING INDEX HERE BECUASE THE PARAGRAPHS IN THE 2 FORM HAS THE SAME CLASSES
    var index = (type == "admin") ? 1 : 0; 
        let usernameMSG        = document.getElementsByClassName("usernamep")[index];
        let emailMSG           = document.getElementsByClassName("emailp")[index];
        let passwordMSG        = document.getElementsByClassName("passp")[index];
        let confirmpasswordMSG = document.getElementsByClassName("confirmpassp")[index];

    // DECLARING WHICH INPUTS ARE WE DEALING WITH
    var username = (type == "admin") ? adminUsername : seekerUsername;
    var password = (type == "admin") ? adminPassword : seekerPassword;
    var confirm  = (type == "admin") ? adminConfirm  : seekerConfirm;
    
    // Validtion --------------------------------------

    // USERNAME VALIDATION
    if (username.value == "")
        {
            usernameMSG.innerHTML = "You must write a username"
        }
    else if(username.value.length < 4) 
        {
            usernameMSG.innerHTML = "Username must be at least 4 characters"
        }
    else
        {
          usernameMSG.innerHTML = "";           
        }


    // PASSWORD VALIDATION
        var currentStrength = checkstrength();

    if (password.value == "")
        {
            passwordMSG.innerHTML = "You must write a password"
        }
    else if (password.value.length < 8)
        {
            passwordMSG.innerHTML ="Password must be at least 8 characters";
        }
    else if (currentStrength < 3) 
        {
            passwordMSG.innerHTML ="Password is weak";
        }
    else 
        {
            passwordMSG.innerHTML ="";
        }

    // CONFIRM PASSWORD VALIDATION 
    if (password.value != confirm.value)
        {
            confirmpasswordMSG.innerHTML = "Passwords do not match";
        }
    else 
        {
            confirmpasswordMSG.innerHTML = "";
        }

    // CONFIRM COMPANY
 

}