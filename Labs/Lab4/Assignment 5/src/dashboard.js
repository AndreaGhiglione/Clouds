import {auth, db, dbFirestore} from "./firebase.js";
import {ref, onValue, set, get, child} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-database.js";
import {doc, updateDoc, deleteField, getDoc, setDoc, collection, addDoc, getDocs, query, where} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-firestore.js";
import {ref as sRef} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-storage.js";

var flagLogout = false;

window.onload = () =>  {
    checkLogin();
}

function checkLogin(){
    auth.onAuthStateChanged((user) => {
        if(user){
            // Modify "USER" with the name and surname of the user
            document.querySelector('#username').innerHTML = user.displayName;
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
                console.log("You are not logged in, redirecting to login page");
            window.location.href = "login.html";
        }
    })

}

// user's id, movie's data, row to hide
async function addToWishList(uid, data){
    // movie's fields
    var mid = data.id; 
    var title = data.title;
    var year = data.year;
    var genre = data.genre;
    // remove the row from display
    var rowId = document.querySelector('#button_table_' + mid).parentNode.parentNode.rowIndex;
    document.querySelector("#table_movies").deleteRow(rowId);

    // first, we hide the movie from the movie's list among which the user can pick favorites
    set(ref(db, uid + "/" + mid), {
        "genre": genre,
        "id": mid,
        "title": title,
        "year": year,
        "inWishList": true
    })
    
    // now we add that movie to the user's wishlist
    var userDocRef = doc(dbFirestore, "wishlist", uid);
    var userDocSnap = await getDoc(userDocRef);
    if(userDocSnap.exists()){
        // add a field with another movie
        updateDoc(userDocRef, {
            [mid]: {"genre": genre, "id": mid, "title": title, "year": year} 
        })
    }
    else{
        // the document for the specific user does not exist -> creating one
        setDoc(doc(dbFirestore, "wishlist", uid), {
            [mid]: {"genre": genre, "id": mid, "title": title, "year": year} 
        })
    }
}


// display page
function setPage(uid_user){
    // User logged in
    console.log(uid_user);
    // Read data in real-time db
    var realTimeDbRef = ref(db);

    // read one time only the db, because we have to set it
    get(child(realTimeDbRef, ""+uid_user)).then((snapshot) => {
        if(snapshot.exists()){
            // User already logged in
            var table = document.querySelector('#table_movies');
            var container = document.querySelector('#container');
            var data = snapshot.val(); 
            var rowCount = 0;
            for(let i in data){
                // check if the movie is already in wishlist (in case, don't display it)
                if(!data[i].inWishList){
                    var row = table.insertRow(-1);
                    row.insertCell(0).innerHTML = data[i].title;
                    row.insertCell(1).innerHTML = data[i].year;
                    row.insertCell(2).innerHTML = data[i].genre;
                    // add the button for wishlist
                    var currId = "button_table_" + i;
                    row.insertCell(3).innerHTML = '<button id=' + currId + ' class="heart">Add</button>';
                    document.querySelector('#' + currId).onclick = () => addToWishList(uid_user, data[i]);
                    //document.querySelector('#' + currId).innerHTML = '<img src="heart.png" style="width:420px;height:420px;margin-top: -13px;margin-left: -18px; margin-bottom: -11px; />';
                    rowCount++;
                } 
            }
            document.querySelector("#msg_load").setAttribute("style","visibility:hidden");
            container.setAttribute("style","visibility:visible;");
        }
        else {
            // First ever login for this user
            // add node with uid in the database and append all movies from movies.json
            addNewUser(uid_user);
          }
        }).catch((error) => {
          console.error(error);
        });
                
} 


// set the page for a new user (first time login)
function addNewUser(uid_user){
    var realTimeDbRef = ref(db);
    // get the movies from the movies list
    get(child(realTimeDbRef, "movies-list")).then((snapshot) => {
        if(snapshot.exists()){
            for(let movieId in snapshot.val()){
                var movie = snapshot.val()[movieId];
                var genre = movie.genre;
                var id = movie.id;
                var title = movie.title;
                var year = movie.year;
                // add record to the user's movie-list
                set(ref(db, uid_user + "/" + id), {
                    "genre": genre,
                    "id": id,
                    "title": title,
                    "year": year,
                    "inWishList": false
                })
                // then, display all the movies
                var table = document.querySelector('#table_movies');
                var container = document.querySelector('#container');
                var row = table.insertRow(-1);
                row.insertCell(0).innerHTML = title;
                row.insertCell(1).innerHTML = year;
                row.insertCell(2).innerHTML = genre;
                // add the button for wishlist
                var currId = "button_table_" + movieId;
                row.insertCell(3).innerHTML = '<button id=' + currId + ' class="heart">Add</button>';
                document.querySelector('#' + currId).onclick = () => addToWishList(uid_user, movie);
            }
            document.querySelector("#msg_load").setAttribute("style","visibility:hidden");
            container.setAttribute("style","visibility:visible;");
        }
        else{
            console.log("Error retrieving the movies list");
        }
    })
    /*
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
                "id": id,
                "title": title,
                "year": year,
                "inWishList": false
            })
            // then, display all the movies
            var table = document.querySelector('#table_movies');
            var container = document.querySelector('#container');
            var row = table.insertRow(-1);
            row.insertCell(0).innerHTML = title;
            row.insertCell(1).innerHTML = year;
            row.insertCell(2).innerHTML = genre;
            // add the button for wishlist
            var currId = "button_table_" + i;
            row.insertCell(3).innerHTML = '<button id=' + currId + ' class="heart">Add</button>';
            document.querySelector('#' + currId).onclick = () => addToWishList(uid_user, data[i]);
        }
        document.querySelector("#msg_load").setAttribute("style","visibility:hidden");
        container.setAttribute("style","visibility:visible;");
    });
    */
}