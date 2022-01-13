import {SvgPlus} from "../3.5.js"
import {Td, Tr, THead, TBody} from "../SvgPlus/Table.js"

const AccountTypes = {
  "Assets": {
    "Current": {
      "Cash at Bank": [],
      "Petty Cash": [],
      "Accounts Receivable": [],
      "Inventory": [],
      "Pre-paid Expenses": [],
      "Other": [],
    },
    "Non Current": {
      "Leasehold": [],
      "Property and Land": [],
      "Renovations": [],
      "Furniture and Fitout": [],
      "Vehicles": [],
      "Equipment": [],
      "Computer Equipment": [],
    }
  },
  "LiabilitieS": {
    "Current": {
      "Credit Cards Payable": [],
      "Accounts Payable": [],
      "Interest Payable": [],
      "Accrued Wages": [],
      "Income Tax": [],
    },
    "Long Term": {
      "Loans": [],
      "Equipment Finance": [],
    }
  },
  "Owners Equity": {
    "Profit and Loss": [],
    "Drawings": [],
    "Capitol": []
  },
}


class BalanceSheet extends SvgPlus {
  constructor(el, data = AccountTypes){
    super(el);
    for (let name in data) {
      this.appendChild(new Section(data[name], name))
    }
  }
}

class Section extends SvgPlus{
  constructor(section, name){
    super("tbody");
    if (Array.isArray(section)) {
      this.appendChild(new SectionValues(section, name))
    } else if (typeof section == "object") {
      this.appendChild(new SectionTitle(name));
      for (let subname in section) {
        this.appendChild(new Section(section[subname], subname))
      }
    }
  }
}

class SectionTitle extends SvgPlus {
  constructor(title){
    super("tr");
    this.createChild("th", {
      colspan: 100,
    }).innerHTML = title;
  }
}

class SectionValues extends SvgPlus {
  constructor(values, name) {
    super("tr");
    values.unshift(name);
    for (let value of values) {
      this.createChild("td").innerHTML = value;
    }
  }
}

export {BalanceSheet}
