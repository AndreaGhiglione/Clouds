import {auth, db, dbFirestore} from "./firebase.js";
import {ref, onValue, set, get, child} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-database.js";
var flagLogout = false;

window.onload = () =>  {
    checkLogin();
}

function checkLogin(){
    auth.onAuthStateChanged((user) => {
        if(user){
            // Do logout if clicking the logout button
            document.querySelector("#logout").onclick = () => {
                flagLogout = true;
                auth.signOut().then(function() {
                    flagLogout = true;
                    console.log("Signed out");
                } , function(error) {
                    console.error("Sign out Error", error);
                })
            }
            setPage(user.uid);
        }
        else{
            if(!flagLogout)
                alert("You are not logged in, redirecting to login page");
            window.location.href = "login.html";
        }
    })

}

function setPage(uid_user){
    // User logged in
    console.log(uid_user);
    // Read data in real-time db
    var realTimeDbRef = ref(db);
    // read one time only the db, because we have to set it
    get(child(realTimeDbRef, ""+uid_user)).then((snapshot) => {
        if(snapshot.exists()){
            alert("User already logged in in the past")
            // User already logged in (..wishlist..)
            var table = document.querySelector('#table_movies');
            // Check if user uid is not among the already logged in users in the past
            var data = snapshot.val(); 
            for(let i in data){
                var row = table.insertRow(-1);
                row.insertCell(0).innerHTML = data[i].title;
                row.insertCell(1).innerHTML = data[i].year;
                row.insertCell(2).innerHTML = data[i].genre;
                row.insertCell(3).innerHTML = "button_to_add";
            }
            table.setAttribute("style","visibility:visible;");
        }
        else {
            // First ever login for this user
            alert("First ever user login");
            // add node with uid in the database and append all movies from movies.json
            addNewUser(uid_user);
          }
        }).catch((error) => {
          console.error(error);
        });
                
} 

function addNewUser(uid_user){
    fetch("./movies_small.json")
    .then(response => {
        return response.json();
    })
    .then(jsondata => {
        var data = jsondata["movies-list"];
        for(let i in data){
            var genre = data[i].genre;
            var id = data[i].id;
            var title = data[i].title;
            var year = data[i].year;
            // add record to the db
            set(ref(db, uid_user + "/" + id), {
                "genre": genre,
                "title": title,
                "year": year
            })
            // then, display all the movies (..wishlist..)
            var table = document.querySelector('#table_movies');
            var row = table.insertRow(-1);
            row.insertCell(0).innerHTML = title;
            row.insertCell(1).innerHTML = year;
            row.insertCell(2).innerHTML = genre;
            row.insertCell(3).innerHTML = "button_to_add";
        }
        table.setAttribute("style","visibility:visible;");
    });
}