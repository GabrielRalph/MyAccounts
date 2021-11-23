import {GeneralJournal} from "./GeneralJournal.js"
import {onUpdate, onRemove} from "./FireUser.js"


class FireJournal extends GeneralJournal {
  constructor(){
    super();
    onUpdate((data) => {
      this.addEntry(data.key, data.val());
    })

    onRemove((data) => {
      this.removeEntry(data.key);
    })
  }
}


export {FireJournal}
