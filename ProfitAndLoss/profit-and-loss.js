import {SvgPlus} from "../SvgPlus/4.js"
import {GJObj, AccountTypes, mF, dF} from "../gj.js"
import {THead, TBody, Tr, Td} from "../Utilities/Table.js"
import {InputPlus} from "../Utilities/input-plus.js"

class FromToDateInput extends SvgPlus {
  /**
   * Creates a date range input with "from" and "to" date inputs.
   * @param {string} from - The initial "from" date value.
   * @param {string} to - The initial "to" date value.
   */
  constructor(from, to){
    super("div");
    this.class = "head"

    // Create the from input
    this.fromInput = this.createChild(InputPlus, {events: {
      "focusout": () => {
        this._applyDate("from");
        this.dispatchEvent(new Event("change"));
      },
      "keydown": (e) => e.key == "Enter" ? document.activeElement.blur() : null
    }}, {value: from, type: "date", class: "left"});

    // Create the "to" label in between the inputs 
    this.createChild("span", {content: "to"})

    // Create the to input
    this.toInput = this.createChild(InputPlus, {events: {
      "focusout": () => {
        this._applyDate("to");
        this.dispatchEvent(new Event("change"));
      },
      "keydown": (e) => e.key == "Enter" ? document.activeElement.blur() : null
    }}, {value: to, type: "date", class: "right"});

    this._applyDate("from");
    this._applyDate("to");
  }

  // Apply the date from the input to the property
  _applyDate(name) {
    this[name] = dF(this[`${name}Input`].value);
    this[`${name}Input`].result = "";
  }

  /**
   * Sets the "to" date value.
   * @param {string} value - The new "to" date value.
   */
  set to(value){
    this.toInput.value = value;
    this._to = value;
  }

  /**
   * Gets the "to" date value.
   * @returns {string} The current "to" date value.
   */
  get to() {
    return this._to;
  }

  /**
   * Sets the "from" date value.
   * @param {string} value - The new "from" date value.
   */
  set from(value){
    this.fromInput.value = value;
    this._from = value;
  }

  /**
   * Gets the "from" date value.
   * @returns {string} The current "from" date value.
   */
  get from() {
    return this._from;
  }
}

class TableItem {
  /**
   * Creates a table item with a name and value.
   * @param {string} name - The name of the table item.
   * @param {number} value - The value of the table item.
   */
  constructor(name, value = null, isHeader = false) { 
    this.items = [];
    this.value = value;
    this.name = name;
    this.subtotal = 0;
    this.isHeader = isHeader;
    this.showSubtitle = true;
  }

  get amount() {
    return (this.value || this.subtotal || 0);
  }

  push(...params) {
    let item = null;
    if (params.length == 1 && params[0] instanceof TableItem) {
      item = params[0];
    } else {
      item = new TableItem(...params);
    }

    this.items.push(item);

    this.subtotal += item.amount;
  }

  toTBody(depth = 0) {
    if (this.items.length == 0) {
      let tr = new SvgPlus("tr");
      if (this.isHeader) tr.class = "subtotal";
      tr.styles = {"--depth": depth};
      tr.createChild(this.isHeader ? "th" : "td", {content: this.name});
      tr.createChild("td", {content: mF(this.amount)});
      return tr;
    } else {
      let tbody = new SvgPlus("tbody");
      tbody.setAttribute("depth", depth);

      // Add category title row
      tbody.createChild("tr", {
        class: "category-title", 
        styles: {"--depth": depth}
      }).createChild("th", {
        content: this.name,
        colspan: 2,
      });

      // Add each item as a row
      for (let item of this.items) {
        let item_tbody = item.toTBody(depth + 1);
        tbody.appendChild(item_tbody);
      }

      if (this.showSubtitle) {
      // Add subtotal row
        let subtotal_tr = tbody.createChild("tr", {
          class: "subtotal", 
          styles: {"--depth": depth}
        });
        subtotal_tr.createChild("td", {content: "Total " + this.name});
        subtotal_tr.createChild("td", {content: mF(this.subtotal)});
      }
      return tbody;
    }
  }
}

class ProfitAndLoss extends SvgPlus {
  constructor(el){
    super(el);
  }

  onconnect(){
    this.create();
    let fireuser = document.getElementsByTagName("fire-user")[0];
    this.load(fireuser);
  }

  create(){
    if (!this._created) {
      this._created = true;
      this.innerHTML = "";

      // Create the date period input
      this.periodInput = this.createChild(FromToDateInput, {events: {
        "change": () => { this.render(); }
      }}, this.from, this.to);
      
      console.log(this.periodInput.from)

      // Create the profit and loss table
      this.table = this.createChild("table", {class: "pl-table"});
    }
  }

  set from(value){
    if (this._created) {
      this.periodInput.from = value;
      this.render();
    } else {
      this._from = value;
    }
  }

  get from(){
    return (this.periodInput?.from || this._from);
  }

  set to(value) {
    if (this._created) {
      this.periodInput.to = value;
      this.render();
    } else {
      this._to = value;
    }
  }
  get to(){
    return (this.periodInput?.to || this._to);
  }

  async load(fireuser){
    // Load the general journal data
    let gj = await fireuser.get("journal");
    this.gj = new GJObj(gj.val());

    // Load the accounts list
    this.accounts = (await fireuser.get("accounts")).val();
    if (this.accounts == null) this.accounts = {};

    // Get all account types
    this.accountTypes = AccountTypes.allNames();

    this.render();

    const event = new Event("load");
    this.dispatchEvent(event);
  }

  /**
   * Gets the account balances within the specified date range.
   * @returns {Object<string, number>} An object containing account balances.
   */
  get accountBalances(){
    let bals = {};
    if (this.gj) {
      bals = this.gj.getBalances(this.from, this.to);
    }
    return bals;
  }

  /**
   * Gets the balances grouped by account type.
   * @returns {Object<string, number>} An object containing balances by account type.
   */
  get balancesByType(){
    let {accountBalances, accounts} = this;
    let bytype = {};
    for (let accname in accountBalances) {
      if (accname in accounts) {
        let type = accounts[accname];
        if (!(type in bytype)) bytype[type] = 0;
        bytype[type] += accountBalances[accname];
      }
    }
    return bytype;
  }

  /**
   * Gets the income account balances.
   * @returns {Array} An array of income account balances.
   */
  get incomeBalances_1(){
    let {accounts, accountBalances} = this;
    let incomeBalances = [];
    let subtotal = 0;

    // For each account
    for (let accname in accountBalances) {

      // If it's an income account (type "5000")
      if (accounts[accname] == AccountTypes.Income) {
        let value = -1 * accountBalances[accname];
        incomeBalances.push(["", accname, mF(value), ""]);
        subtotal += value;
      }
    }
    if (incomeBalances.length > 0) {
      if (incomeBalances.length > 1) {
        incomeBalances.push(["", "Subtotal", mF(subtotal), ""]);
      }
      incomeBalances[0][0] = "Gross Business Income"
      incomeBalances.subtotal = subtotal;
    }
    return incomeBalances;
  }

  get incomeBalances(){
    let {accounts, accountBalances} = this;
    let incomeBalances = new TableItem("Gross Business Income");

    // For each account if it's an income account 
    // add it to the income balances
    for (let accname in accountBalances) {
      if (accounts[accname] == AccountTypes.Income) {
        let value = -1 * accountBalances[accname]; // Invert income values
        incomeBalances.push(accname, value);
      }
    }

    return incomeBalances;
  }

  get expenseBalances_1() {
    let {balancesByType} = this;
    let expenseBalances = [];
    let total = 0;
    for (let expcat in AccountTypes.Expenses) {
      let subtotal = 0;
      let init = 0;
      let category = [];
      for (let expacc in AccountTypes.Expenses[expcat]) {
        let type = AccountTypes.Expenses[expcat][expacc];
        let title = init == 0 ? expcat + " Expenses" : "";
        init = 1;
        let value = 0;
        if (type in balancesByType) {
          value = balancesByType[type];
        }
        subtotal += value;;
        category.push([title, expacc, mF(value), ""]);
      }
      total += subtotal;
      category.subtotal = subtotal;
      category.push(["", "Subtotal", mF(subtotal), ""])
      expenseBalances.push(category);
    }
    expenseBalances.total = total;
    return expenseBalances;
  }

  get expenseBalances() {
    let {balancesByType} = this;
    let expenseBalances = new TableItem("Expenses");
    for (let expcat in AccountTypes.Expenses) {
      let expenseCategory = new TableItem(expcat + " Expenses");
      expenseCategory.showSubtitle = false;
      for (let expacc in AccountTypes.Expenses[expcat]) {
        let type = AccountTypes.Expenses[expcat][expacc];
        let value = balancesByType[type];
        if (value) {
          expenseCategory.push(expacc, balancesByType[type] || 0);
        }
      }
      expenseBalances.push(expenseCategory);
    }
    return expenseBalances;
  }


  render_layout1(){
    let {table, incomeBalances, expenseBalances} = this;
    if (incomeBalances.length == 0 && expenseBalances.length == 0) {
      table.innerHTML = "<tbody><tr><td>No data for the selected period.</td></tr></tbody>";
      return;
    } else if (incomeBalances.length == 0) {
      incomeBalances.push(["Gross Business Income", "", mF(0), ""]);
      incomeBalances.subtotal = 0;
    }
    expenseBalances.unshift(incomeBalances);

    const totals = [
      [["Total expenses (B) plus (C)", mF(expenseBalances.total), ""]],
      [["Net income (A) less (D)", mF(incomeBalances.subtotal - expenseBalances.total), ""]]
    ]
    
    table.innerHTML = "";
    try {
      for (let tcat of expenseBalances) {
        let tbody = TBody.fromArray(tcat);
        tbody.class = "category";
        table.appendChild(tbody);
      }

      for (let tcat of totals) {
        let tbody = TBody.fromArray(tcat);
        tbody.class = "totals";
        tbody.querySelectorAll("tr > td:nth-child(1)").forEach(td => td.setAttribute("colspan", "2"));
        table.appendChild(tbody);
      }
    } catch(e) {
      console.error("Error rendering Profit and Loss table:", e);
    }
    table.styles = {
      "--rows": table.querySelectorAll("tr").length,
    }
  }

  render() {
    let {table, incomeBalances, expenseBalances} = this;
    table.innerHTML = "";

    let profitBT = incomeBalances.amount - expenseBalances.amount;
    table.appendChild(incomeBalances.toTBody());
    table.appendChild(expenseBalances.toTBody());
    table.appendChild(new TableItem("Net Profit/(Loss) before tax", profitBT, true).toTBody());

  }
  
  static get observedAttributes() {return ["from", "to"]};
}

SvgPlus.defineHTMLElement(ProfitAndLoss);
