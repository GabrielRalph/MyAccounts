import {SvgPlus} from "../3.5.js";
import {signIn, signOut, onUser, onLeave, getUserGJ} from "../FireUser.js"


class Accounts extends SvgPlus {
  constructor(el) {
    super(el);
    this.load();
  }
  async load(){
    let gj = await getUserGJ();
    let names = gj.accountNames;
    for (let name of names) {
      this.appendChild(new Account({
        name: name,
        type: null,
      }))
    }
  }
}

class Account extends SvgPlus{
  constructor(account){
    super("gj-account");
    this.createChild("div", {class: "name"}).innerHTML = account.name;
    this.type = this.createChild("div", {class: "type"});
    if (account.type) {
      this.type.innerHTML = account.type;
    }else {
      this.type.innerHTML = "no type"
    }
  }
}



window.onclick = signIn;

onLeave(() => {
  window.onclick = signIn;
})


onUser(() => {
  window.onclick = null;
  new Accounts("accounts");
})
