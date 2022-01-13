import {addProps} from "../SvgPlus/props.js"

const YearsMS = (1000 * 60 * 60 * 24 * 365);
const AccountTypes = {
  "Expenses": {
    "Non Variable": {
      "Accountancy": 1100,
      "Depreciation Expenses": 1120,
      "Insurance Premiums": 1130,
      "Interest on Money Borrowed": 1140,
      "Government Charges": 1150,
      "Registration": 1160,
      "Rent": 1170,
      "Other": 1180,
    },
    "Variable": {
      "Advertising": 1200,
      "Bank Charges": 1210,
      "Cost of Goods Sold": 1220,
      "Freight, Cartage and Travelling Expenses": 1230,
      "Motor Vehicle Running Expenses": 1240,
      "Hire Expenses": 1250,
      "Journal and Periodicals Expenses": 1260,
      "Power Cost": 1270,
      "Phone Cost": 1280,
      "Printing and Stationery": 1290,
      "Materials": 1201,
      "Repairs and Maintenance": 1211,
      "Wages Paid": 1221,
      "Capitol Items": 1231,
      "Other": 1241
    }
  },
  "Assets": {
    "Current": {
      "Cash at Bank": 2100,
      "Petty Cash": 2110,
      "Accounts Receivable": 2130,
      "Inventory": 2140,
      "Pre-paid Expenses": 2150,
      "Other": 2160,
    },
    "Non Current": {
      "Leasehold": 2200,
      "Property and Land": 2210,
      "Renovations": 2220,
      "Furniture and Fitout": 2230,
      "Vehicles": 2240,
      "Equipment": 2250,
      "Computer Equipment": 2260,
    }
  },
  "Liabilitie": {
    "Current": {
      "Credit Cards Payable": 3100,
      "Accounts Payable": 3110,
      "Interest Payable": 3120,
      "Accrued Wages": 3130,
      "Income Tax": 3140,
    },
    "Long Term": {
      "Loans": 3200,
      "Equipment Finance": 3210,
    }
  },
  "Owners Equity": {
    "Drawings": 4100,
    "Capitol": 4110,
  },
  "Income": 5000,

  allNames: () => {
    let names = {};

    let recur = (obj) => {
      for (let key in obj) {
        let val = obj[key];
        if (typeof val == 'number') {
          names[val] = key;
        } else {
          recur(val)
        }
      }
    }
    recur(AccountTypes)
    return names;
  }
}
const EntryProps = {
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

function mF(money) {
  if (Number.isNaN(money) || !money) {
    return "-"
  }
  return "$" + Math.round(money);
}

function dF(date){
  if (date == -1) return "";
  let d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-"
  d = (""+d).split(" ");
  return `${d[2]} ${d[1]} ${d[3]}`;
}

function dep_func(date_n, date_0, lifespan) {
  let delta = 1 - (date_n - date_0) / (YearsMS * lifespan);
  delta = delta > 1 ? 1 : (delta < 0 ? 0 : delta);
  return delta;
}


class GJObj {
  #entries = [];
  #entries_table = {};
  #names = {};

  constructor(entries) {
    for (let key in entries) {
      this.addEntry(entries[key], key);
    }
  }

  containsKey(key){
    return key in this.#entries_table;
  }

  addEntry(entry, key) {
    if (!this.containsKey(key)) {
      let e = {key: key};
      addProps(EntryProps, entry, e);

      this.#names[e["credit-acc"]]  = true;
      this.#names[e["debit-acc"]]  = true;
      this.#entries.push(e);
      this.#entries_table[key] = e;
    }
  }

  get accountNames(){
    return Object.keys(this.#names);
  }

  getDepreciation(entry, from = 0, to = null) {
    to = getTime(to);
    from = getTime(from);

    if (from > to) return 0/0;

    let acc = 0;
    let lifespan = entry.lifespan;
    if (lifespan > 0) {
      let date = entry.date;
      let dep_from = dep_func(from, date, lifespan);
      let dep_to = dep_func(to, date, lifespan);
      let dep_acc = dep_from - dep_to;
      acc = entry.debit * dep_acc;
    }
    return acc;
  }

  getBalances(from = 0, to = null) {
    from = getTime(from, 0);
    to = getTime(to);

    let bals = {
      "Accumulated Depreciation": 0,
      "Depreciation Expenses": 0,
    };
    for (let entry of this.#entries) {
      let dacc = entry["debit-acc"];
      let cacc = entry["credit-acc"];

      if (entry.date <= to && entry.date >= from) {
        if (!(dacc in bals)) bals[dacc] = 0;
        if (!(cacc in bals)) bals[cacc] = 0;
        bals[dacc] += entry.debit;
        bals[cacc] -= entry.credit;
      }

      let dep = this.getDepreciation(entry, from, to);
      bals["Accumulated Depreciation"] += dep;
      bals["Depreciation Expenses"] += dep;
    }

    return bals;
  }
}

export {GJObj, AccountTypes, EntryProps, mF, dF, dep_func, getTime}
