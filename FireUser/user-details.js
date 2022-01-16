import {SvgPlus} from "../SvgPlus/4.js"

const DefaultUser = {
  first_name: "",
  last_name: "",
  city: "",
  postcode: "",
  address: "",
  number: "",
  email: "",
  email: "",
}

class UserDetails extends SvgPlus {
  #fields = [];
  onconnect(){
    let fireUser = document.getElementsByTagName("fire-user")[0];
    let loaded = false;
    if (fireUser) {
      fireUser.onValue("details", (data) => {
        this.setDetailsData(data.val());
        if (!loaded) {
          const event = new Event("load");
          this.dispatchEvent(event);
          loaded = true;
        }
      })
    }
  }

  set fields(text){
    if (typeof text === "string" && text.length > 0) {
      let list = text.split(" ");
      this.#fields = list;
    } else {
      this.#fields = [];
    }
  }

  setDetailsData(value){
    if (value == null) value = DefaultUser;
    this.innerHTML = "";
    let name = `${value.first_name} ${value.last_name}`;
    let address = `${value.city}, ${value.postcode}<br/> ${value.address}<br/>`
    let contact = `${value.number}<br/> ${value.email}`

    this.createChild("H1", {content: name});
    let row = this.createChild("div", {class: "row"})
    row.createChild("span", {content: address})
    row.createChild("span", {content: contact})

    let opt = this.createChild("div", {class: "optionals"})
    for (let field of this.#fields) {
      if (field in value && value[field]) {
        let cont = `${field.toUpperCase()}: ${value[field]}`
        opt.createChild("div", {content: cont})
      }
    }
  }

}

SvgPlus.defineHTMLElement(UserDetails);
