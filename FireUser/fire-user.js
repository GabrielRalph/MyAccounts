import sheet from './styles.css' assert { type: 'css' };
SvgPlus.addCSSSStyleSheet(sheet);

import {SvgPlus} from "../SvgPlus/4.js"
import {initializeApp} from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js'
import {getAuth, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js'
import {getDatabase, child, push, ref, update, get, onValue, onChildAdded, onChildChanged, onChildRemoved, set} from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-database.js'

let DBL_CHECK = 0;

let APP = null;
let DB = null;
let AUTH = null;

class FireUser extends SvgPlus {
  #templates = {}
  #users_ref = "";
  #faded = false;
  constructor(el = "div"){
    if (DBL_CHECK !== 0) throw "Only one fire user per document"
    DBL_CHECK = 1;
    super(el);

    for (let el of this.children) {
      this.#templates[el.getAttribute("name")] = el.innerHTML;
    }

    this.innerHTML = "";
    this.userFrame = this.createChild("div", {
      class: "user-frame",
    });
    this.loader = this.createChild("div", {
      class: "loader",
      content: this.#templates.loader,
    })

    let config = this.#templates.config;
    config = JSON.parse(config);

    APP = initializeApp(config);
    DB = getDatabase(APP);
    AUTH = getAuth();

    onAuthStateChanged(AUTH, (userData) => {
      if (userData == null) {
        this.#onleave(userData);
      } else {
        this.#onuser(userData);
      }
    });
  }

  async fade(value, time = 300){
    value = !value;
    let contains = this.contains(this.loader);
    await this.waveTransition((t) => {
      if (value && !contains) {
        this.appendChild(this.loader);
        contains = true;
      }
      this.loader.styles = {"--fade-factor": t}
    }, time, value);
    if (!value && this.contains(this.loader)){
      this.removeChild(this.loader);
    }
    this.#faded = value;
  }

  set loaded(value){
    if (this.#faded != value) {
      this.fade(value);
    }
  }

  #onuser(user){
    this.user = user;
    this.userFrame.innerHTML = this.#templates.user.replace(/{{([^}]*)}}/g, (a, b) => {
      return user[b];
    });
    let signouts = this.querySelectorAll('[signout=""]');
    for (let el of signouts) el.onclick = () => {this.signOut()};
    const event = new Event("user");
    this.dispatchEvent(event);
  }

  #onleave(){
    this.user = null;
    this.userFrame.innerHTML = this.#templates["no-user"];
    let signins = this.querySelectorAll('[signin=""]');
    for (let el of signins) el.onclick = () => {this.signIn()};
    const event = new Event("leave");
    this.dispatchEvent(event);
  }

  signIn(){
    const provider = new GoogleAuthProvider();
    signInWithRedirect(AUTH, provider);
  }

  signOut(){
    AUTH.signOut();
  }

  set "users-ref"(value){
    this.#users_ref = value;
  }

  get database(){
    return DB;
  }

  get uid(){
    return this.user.uid;
  }

  get userRef(){
    return ref(DB, this.#users_ref + this.uid)
  }

  get(value){
    return get(child(this.userRef, value));
  }
  update(value, data){
    return update(child(this.userRef, value), data)
  }
  set(value, data){
    return set(child(this.userRef, value), data)
  }
  onChildChanged(value, callback){
    onChildChanged(child(this.userRef, value), callback);
  }
  onChildAdded(value, callback){
    onChildAdded(child(this.userRef, value), callback);
  }
  onChildRemoved(value, callback){
    onChildRemoved(child(this.userRef, value), callback);
  }
  onValue(value, callback){
    onValue(child(this.userRef, value), callback);
  }
}

SvgPlus.defineHTMLElement(FireUser);
export {DB, child, push, ref, update, get, onChildAdded, onChildChanged, onChildRemoved, set}
