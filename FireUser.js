import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js'
import {getAuth, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js'
import {getDatabase, child, push, ref, update, get, onChildAdded, onChildChanged, onChildRemoved, set} from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-database.js'
import {GJObj} from "./gj.js"

// auth
let config = {
  apiKey: "AIzaSyAwKRqxNdoO05hLlGZwb5AgWugSBzruw6A",
  authDomain: "myaccounts-4a6c7.firebaseapp.com",
  databaseURL: "https://myaccounts-4a6c7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myaccounts-4a6c7",
  storageBucket: "myaccounts-4a6c7.appspot.com",
  messagingSenderId: "678570989696",
  appId: "1:678570989696:web:ca70c09476d4c5f627ee65"
};
const APP = initializeApp(config);
const DB = getDatabase(APP);
const auth = getAuth();

let onleave = () => {
  console.log("user out");
}
let onuser = () => {
  console.log("user in");
}

function signIn(){
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
}
function signOut(){
  auth.signOut();
}

function getUser() {
  return auth.currentUser;
}

function onLeave(cb) {
  if (cb instanceof Function) {
    onleave = cb;
  } else {
    onleave = () => {
      console.log("user out");
    }
  }
}
function onUser(cb) {
  if (cb instanceof Function) {
    onuser = cb;
  } else {
    onuser = () => {
      console.log("user in");
    }
  }
}

onAuthStateChanged(auth, (userData) => {
  if (userData == null) {
    onleave(userData);
  } else {
    onuser(userData);
  }
});

// database
function getUserRef(){
  let r = null;
  if (auth.currentUser != null) {
    r = ref(DB, "generalJournal/users/" + auth.currentUser.uid);
  }
  return r;
}

let onupdate = (data) => {
  console.log(data.key, data.val());
}
function onUpdate(cb) {
  if (cb instanceof Function) {
    onupdate = cb;
  } else {
    onupdate = (data) => {
      console.log(data.key, data.val());
    }
  }
}

let onremove = (data) => {
  console.log(data.key, data.val());
}
function onRemove(cb) {
  if (cb instanceof Function) {
    onremove = cb;
  } else {
    onremove = (data) => {
      console.log(data.key, data.val());
    }
  }
}

function syncUser(){
  let userRef = getUserRef();
  if (userRef != null) {
    onChildAdded(userRef, (data) => {
      onupdate(data);
    });
    onChildChanged(userRef, (data) => {
      onupdate(data);
    });
    onChildRemoved(userRef, (data) => {
      onremove(data);
    });
  }
}

function addEntry(data) {
  let userRef = getUserRef();
  if (userRef != null) {
    let key = push(userRef).key;
    updateEntry(key, data);
  }
}

function updateEntry(key, data) {
  let userRef = getUserRef();
  if (userRef != null) {
    let updates = {};
    if (key == null) {
      key = push(userRef).key;
    }
    updates[key] = data;
    update(userRef, updates);
  }
}

async function getUserGJJSON(){
  let refgj = child(getUserRef(), "journal");
  let res = await get(refgj);
  return res.val();
}

async function getUserGJ(){
  return new GJObj(await getUserGJJSON());
}


export {signIn, signOut, getUser, onUser, onLeave, onUpdate, onRemove, syncUser, updateEntry, getUserGJ}
