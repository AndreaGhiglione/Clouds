import { auth, signInWithGoogle } from "./firebase.js";
import { GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.3/firebase-auth.js";

window.onload = () =>  {
    checkLogin();
    const button_login = document.querySelector('#login_button');

    button_login.onclick = () => login();
}

function checkLogin(){
    auth.onAuthStateChanged((user) => {
        if(user){
            console.log("You are already logged in, redirecting to movies dashboard");
            window.location.href = "dashboard.html";
        }
    })

}

function login(){
    signInWithGoogle()
    .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log(user);
        window.location.href = "dashboard.html";
    }).catch((error) => { 
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
  });
}