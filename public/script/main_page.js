

window.onload = function(){
    let us = firebase.auth().currentUser == null;
    console.log(us);

    firebase.auth.onAuthStateChanged(user => {
        if (user) {
          console.log("logged in");
        }
        else {
          // User is signed out.
          console.log("not logged in");
        }
      })
}

let current_us = JSON.parse(localStorage.getItem("USER"));
// User: {"phone":"","username":""}
document.getElementById("username").innerHTML = "Welcome @" + current_us["displayName"];

// Checks if user has accepted the terms and conditions already
function checkUserTAndC() {
    // initialise phone
    let phone = current_us.phone

    // check if user's phone number is in database
    firebase.database().ref(`users/${phone}`).once("value", snapshot => {
        if (snapshot.exists()){
            firebase.database().ref(`users/${phone}/termsAndConditionsAccepted`).once("value", snapshot => {
                // check if termsAndConditionsAccepted field exists
                if (snapshot.exists()) {
                    // check if termsAndConditionsAccepted is true
                    if (snapshot.val()) {
                        window.location.href = "chatbot.html";
                    } else {
                        // if it is not true, move to terms and conditions page
                        window.location.href = "termsAndConditionsPage.html"
                    }
                } else {
                    // else move user to terms and condition page
                    window.location.href = "termsAndConditionsPage.html"
                }
            })
        }
    })
}