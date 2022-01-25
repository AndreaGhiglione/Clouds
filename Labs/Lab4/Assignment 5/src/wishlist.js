import {auth, db, dbFirestore} from "./firebase.js";
import {ref, onValue, set, get, child} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-database.js";
import {doc, updateDoc, deleteField, getDoc, setDoc, collection, addDoc, query, where} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-firestore.js";


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
async function removeFromWishList(uid, data){
    // movie's fields
    var mid = data.id; 
    var title = data.title;
    var year = data.year;
    var genre = data.genre;
    // remove the row from display
    var rowId = document.querySelector('#button_table_' + mid).parentNode.parentNode.rowIndex;
    document.querySelector("#table_movies").deleteRow(rowId);

    // add the movie among the movie's list among which the user can pick favorites
    // I do that with a flag on that movie record
    set(ref(db, uid + "/" + mid), {
        "genre": genre,
        "id": mid,
        "title": title,
        "year": year,
        "inWishList": false
    })
    
    // remove that movie from the user's wishlist
    const userMoviesRef = doc(dbFirestore, "wishlist", uid);
    await updateDoc(userMoviesRef, {
        [mid]: deleteField()
    });
}


// display page - wishlist
async function setPage(uid_user){
    // User logged in
    console.log(uid_user);

    // get all the data in the user's wishlist
    const docRef = doc(dbFirestore, "wishlist", uid_user);
    const docSnap = await getDoc(docRef);
    var table = document.querySelector('#table_movies');
    var container = document.querySelector('#container');
    var flag;
    // check if the user's wishlist is not empty (if created and then removed all the movies???)
    if(docSnap.exists()){
        // first check if the user already created a wishlist and then emptied it
        flag = false;
        var cnt = 0;
        // add wishlist movies to the table that will be displayed
        for(let mid in docSnap.data()){
            flag = true;
            cnt = cnt + 1;
            var movie = docSnap.data()[mid];
            var row = table.insertRow(-1);
            row.insertCell(0).innerHTML = movie.title;
            row.insertCell(1).innerHTML = movie.year;
            row.insertCell(2).innerHTML = movie.genre;
            // add the button for removing from wishlist
            var currId = "button_table_" + mid;
            row.insertCell(3).innerHTML = '<button id=' + currId + ' class="heart">Remove</button>';
            document.querySelector('#' + currId).onclick = () => removeFromWishList(uid_user, docSnap.data()[mid]);
        }
        if(flag){
            document.querySelector("#msg").setAttribute("style","visibility:hidden");
            container.setAttribute("style","visibility:visible;");
        }
        else{
            // display message with empty list and button to go back to movies list
            emptyWishList();
        }
    }
    else{
        emptyWishList();
    }           
} 


function emptyWishList(){
    var node, nodeButton;
    node = document.querySelector("#msg_displayed");
    node.innerHTML = "You did not add any movie to wishlist!";
    nodeButton = document.createElement("button");
    nodeButton.setAttribute("id","btnEmptyWishList");
    nodeButton.setAttribute("onclick","location.href='dashboard.html';");
    nodeButton.innerHTML = "Movies list";
    document.querySelector("#msg").appendChild(nodeButton);
}