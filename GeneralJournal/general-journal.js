import {SvgPlus} from "../SvgPlus/4.js"
import {TBody, Tr, Td} from "../SvgPlus/Table.js"
import {makeProps} from "../SvgPlus/props.js"
import {EntryProps, dF, mF} from "../gj.js"


class JournalEntry extends TBody{
  constructor(key, data = {}){
    super(3, 4);
    Object.defineProperty(this, "key", {
      get: () => key
    })
    this.class = "entry";
    this.data = data;
  }

  get date(){
    return this._data.date;
  }

  get debitAcc() { return this._data["debit-acc"]; }
  get creditAcc() { return this._data["credit-acc"]; }
  get accountNames() { return [this.debitAcc, this.creditAcc]; }

  get debit() { return this._data.debit; }
  get credit() { return this._data.credit; }

  get maxTrans() { return this.debit > this.credit ? this.debit : this.credit; }
  get minTrans() { return this.debit < this.credit ? this.debit : this.credit; }

  get description() {return this._data.description; }
  get lifespan() {return this._data.lifespan; }

  get data(){ return this._data.json; }
  set data(data){
    if (data == null) data = {};
    data = makeProps(EntryProps, data);
    if (data == null) return;
    this._data = data;
    data = data.json;

    this[0].class = "debit";
    this[0][0].value = dF(data.date);
    this[0][0].class = "date"

    this[0][1].value = data["debit-acc"];
    this[0][1].class = "account";

    this[0][2].value = mF(data.debit);
    this[0][2].class = "value";


    this[1].class = "credit";
    this[1][1].value = data["credit-acc"];
    this[1][1].class = "account"

    this[1][3].value = mF(data.credit);
    this[1][3].class = "value";

    this[2].class = "details";
    this[2].merge(1,3);
    if (data.lifespan > 0) {
      this[2][0].innerHTML = `${data.lifespan} years`;
    }
    this[2][1].value = data.description;
    this[2][1].class = "description";
  }
}

class GeneralJournal extends SvgPlus{
  #accountNames = {};
  constructor(el) {
    super(el);
    this.entries = {};
    this._from = 0;
    this._to = Infinity;
    this.class = "journal"
    this.sortKey = "date";
    this.table = this.createChild("table");
  }

  clear(){
    this.innerHTML = "";
    this.entries = {};
    this.#accountNames = {};
  }

  set from(date){
    date = new Date(date);
    let time = date.getTime();
    if (!Number.isNaN(time)) {
      this._from = time;
    }else {
      this._from = 0;
    }
    this.filter();
  }
  get from(){
    return this._from;
  }

  set to(date){
    date = new Date(date);
    let time = date.getTime();
    if (!Number.isNaN(time)) {
      this._to = time;
    }else {
      this._to = Infinity;
    }
    this.filter();
  }
  get to(){
    return this._to;
  }

  get accountNames(){
    return Object.keys(this.#accountNames);
  }

  filter() {
    for (let child of this.children) {
      this.filterElement(child);
    }
  }
  filterElement(element) {
    let filter = "";
    if (element.date < this.from || element.date > this.to) {
      filter = "none";
    }
    element.styles = {
      display: filter,
    }
  }
  sort(key) {
    this.sortKey = key;
    let children = [];
    for (let child of this.table.children) {
      children.push(child);
    }
    children.sort((a, b) => a[key] > b[key] ? 1 : -1);
    for (let child of children) {
      this.table.prepend(child);
    }
  }

  onselect(entry){
    console.log(entry.key);
  }
  ondblselect(entry){
    console.log(entry.key);
  }

  addEntry(key, entryData) {
    if (key == null || entryData == null) return;

    //update
    if (key in this.entries) {
      //remove old account names
      for (let name of this.entries[key].accountNames) {
        delete this.#accountNames[name];
      }
      this.entries[key].data = entryData;

    //add entry
    } else {
      let entry = new JournalEntry(key, entryData);
      entry.onclick = () => {
        this.onselect(entry);
      }
      entry.ondblclick = () => {
        this.ondblselect(entry);
      }
      this.entries[key] = entry;
      this.table.appendChild(entry);
      this.filterElement(entry);
    }

    //add acount names
    for (let name of this.entries[key].accountNames) {
      this.#accountNames[name] = true;
    }
    this.sort(this.sortKey);
  }

  removeEntry(key) {
    if (key in this.entries) {
      let entry = this.entries[key];
      delete this.entries[key];

      //remove old account names
      for (let name of entry.accountNames) {
        delete this.#accountNames[name];
      }
      this.table.removeChild(entry);
    }
  }
}

SvgPlus.defineHTMLElement(GeneralJournal)
