import {SvgPlus} from "../SvgPlus/4.js"
import * as FB from "./firebase-client.js"

let fireUser = null;
class FireUser extends SvgPlus {
  _templates = {}
  _users_ref = "";
  _faded = false;
  constructor(el = "div"){
    if (fireUser !== null) throw "Only one fire user per document"
    super(el);
    fireUser = this;


    for (let el of this.children) {
      this._templates[el.getAttribute("name")] = el.innerHTML;
    }

    this.innerHTML = "";
    this.userFrame = this.createChild("div", {
      class: "user-frame",
    });
    this.loader = this.createChild("div", {
      class: "loader",
      content: this._templates.loader,
    })

    let config = this.getAttribute("config");
    config = JSON.parse(config);
    
    FB.addAuthChangeListener((userData) => {
      console.log(userData);
      if (userData == null) {
        this._onleave(userData);
      } else {
        this._onuser(userData);
      }
    });

    FB.initialise(config);

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
    this._faded = value;
  }

  set loaded(value){
    if (this._faded != value) {
      this.fade(value);
    }
  }

  _onuser(user){
    this.user = user;
    this.userFrame.innerHTML = this._templates.user.replace(/{{([^}]*)}}/g, (a, b) => {
      return user[b];
    });
    let signouts = this.querySelectorAll('[signout=""]');
    for (let el of signouts) el.onclick = () => {this.signOut()};
    const event = new Event("user");
    this.dispatchEvent(event);
  }

  _onleave(){
    this.user = null;
    this.userFrame.innerHTML = this._templates["no-user"];
    let signins = this.querySelectorAll('[signin=""]');
    for (let el of signins) el.onclick = () => {this.signIn()};
    const event = new Event("leave");
    this.dispatchEvent(event);
  }

  signIn(){
    const provider = new FB.GoogleAuthProvider();
    FB.signInWithPopup(provider);
  }

  signOut(){
    FB.signOut();
  }

  set "users-ref"(value){
    this._users_ref = value;
  }

  get database(){
    return FB.getDatabase();
  }

  get uid(){
    return this.user.uid;
  }

  get userRef(){
    return FB.ref(this._users_ref + this.uid)
  }

  push(value) {
    return FB.push(this.child(value));
  }

  child(value){
    return FB.child(this.userRef, value)
  }

  get(value){
      console.log(this.child(value));
    return FB.get(this.child(value));
  }
  update(value, data){
    return FB.update(this.child(value), data)
  }
  set(value, data){
    return FB.set(this.child(value), data)
  }
  onChildChanged(value, callback){
    FB.onChildChanged(this.child(value), callback);
  }
  onChildAdded(value, callback){
    FB.onChildAdded(this.child(value), callback);
  }
  onChildRemoved(value, callback){
    FB.onChildRemoved(this.child(value), callback);
  }
  onValue(value, callback){
    FB.onValue(this.child(value), callback);
  }

  static get observedAttributes() {
    return ["users-ref"];
  }
}

SvgPlus.defineHTMLElement(FireUser);

// export {DB, child, push, ref, update, get, onChildAdded, onChildChanged, onChildRemoved, set}
