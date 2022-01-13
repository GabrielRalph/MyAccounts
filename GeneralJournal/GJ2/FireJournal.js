import {GeneralJournal} from "./GeneralJournal.js"


class FireJournal extends GeneralJournal {
  constructor(){
    super();
    let fireUser = document.getElementsByTagName("fire-user")
    // onUpdate((data) => {
    //   this.addEntry(data.key, data.val());
    // })
    //
    // onRemove((data) => {
    //   this.removeEntry(data.key);
    // })
  }
}


export {FireJournal}
