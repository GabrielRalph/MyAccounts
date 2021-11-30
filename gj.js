import {addProps} from "../SvgPlus/props.js"
let EntryProps = {
  date: {
    type: "time",
  },
  lifespan: {
    type: "number",
    default: 0,
  },
  debit: {
    type: "number",
    default: 0,
  },
  credit: {
    type: "number",
    default: 0,
  },
  "debit-acc": {
    type: "string",
  },
  "credit-acc": {
    type: "string",
  },
  description: {
    type: "string",
  }
}

function getTime(value, def = null){
  if (def == null) def = new Date();
  else if (!(def instanceof Date)) def = new Date(def);

  if (value == null) value = def;
  if (!(value instanceof Date)) value = new Date(value);
  value = value.getTime();
  if (Number.isNaN(value)) {
    value = def.getTime();
  }
  return value;
}

class GJObj {
  #entries = []
  constructor(entries) {
    this.#entries = [];
    for (let key in entries) {
      let entry = {key: key};
      addProps(EntryProps, entries[key], entry);
      this.#entries.push(entry);
    }
  }

  get accountNames(){
    let names = {};
    for (let entry of this.#entries) {
      names[entry["credit-acc"]]  = true;
      names[entry["debit-acc"]]  = true;
    }
    return Object.keys(names);
  }

  getDepreciation(entry, from = 0, to = null) {
    to = getTime(to);
    from = getTime(from);
    if (from > to) return 0/0;

    let acc = 0;
    let lifespan = entry.lifespan;
    if (lifespan > 1) {
      let date = entry.date;
      if (date < from) {
        data = from;
      }
      let age = (to - date) / (1000 * 60 * 60 * 24 * 365.25);
      if (age > lifespan) {
        acc = entry.debit;
      } else if (age > 0) {
        acc = entry.debit * age / lifespan;
      }
    }
    return acc;
  }

  getBalances(from = 0, to = null) {
    from = getTime(from, 0);
    to = getTime(to);

    let bals = {
      "Accumulated Depreciation": 0,
    };
    for (let entry of this.#entries) {
      let dacc = entry["debit-acc"];
      let cacc = entry["credit-acc"];
      if (entry.date < to) {
        if (!(dacc in bals)) bals[dacc] = 0;
        if (!(cacc in bals)) bals[cacc] = 0;

        bals[dacc]+= entry.debit;
        bals[cacc]-= entry.credit;
        bals["Accumulated Depreciation"] += this.getDepreciation(entry, from, to)
        bals["Depreciation Expenses"] += this.getDepreciation(entry, from, to)
      }
    }

    return bals;
  }
}

export {GJObj}
