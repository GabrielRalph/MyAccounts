import {SvgPlus} from "../SvgPlus/4.js"
import {GJObj, AccountTypes, mF, dF} from "../gj.js"
import {THead, TBody, Tr, Td} from "../SvgPlus/Table.js"
import {} from "../SvgPlus/input-plus.js"


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
      this.innerHTML = "";
      let head = this.createChild("div", {class: "head"});
      this.from_input = head.createChild('input-plus', {value: this.from, type: "date", class: "left"});
      head.createChild("span", {content: "to"})
      this.to_input = head.createChild('input-plus', {value: this.to, type: "date", class: "right"});
      this.table = this.createChild("table");
      this._created = true;

      this.from_input.addEventListener("focusout", () => {
        this.from = dF(this.from_input.value);
        this.from_input.result = "";
      })
      this.to_input.addEventListener("focusout", () => {
        this.to = dF(this.to_input.value);
        this.to_input.result = "";
      })

      this.from = dF(this.from_input.value);
      this.from_input.result = "";
      this.to = dF(this.to_input.value);
      this.to_input.result = "";
    }
  }

  set from(value){
    this._from = value;
    if (this._created) {
      this.from_input.value = value;
      this.render();
    }
  }
  get from(){
    return this._from;
  }

  set to(value) {
    this._to = value;
    if (this._created) {
      this.to_input.value = value;
      this.render();
    }
  }
  get to(){
    return this._to;
  }

  async load(fireuser){
    let gj = await fireuser.get("journal");
    this.gj = new GJObj(gj.val());

    this.accounts = (await fireuser.get("accounts")).val();
    if (this.accounts == null) this.accounts = {};
    this.names = AccountTypes.allNames();

    this.render();

    const event = new Event("load");
    this.dispatchEvent(event);
  }

  get accountBalances(){
    let bals = this.gj.getBalances(this._from, this._to);
    let bals_acc = {};
    for (let bal in bals) {
      let acc = this.accounts[bal];
      if (!(acc in bals_acc)) {
        bals_acc[acc] = 0;
      }
      bals_acc[acc] += bals[bal];
    }
    return bals_acc;
  }

  render(){
    if (!this.gj) return;
    let bals_acc = this.accountBalances;
    let l = "A";
    let inc = () => {let oldl = l; l = String.fromCharCode(l.charCodeAt(0) + 1); return `(${oldl})`}

    let table = this.table;
    table.innerHTML = "";

    let income = bals_acc["5000"]*-1
    let gross_income = new TBody(1, 4);
    table.appendChild(gross_income);
    gross_income[0].merge(0, 1);
    gross_income[0][0].value = "Gross business income for the period of statement"
    gross_income[0][2].value = mF(income);
    gross_income[0][3].value = inc();

    let total_exp = 0;
    for (let sub_exp in AccountTypes.Expenses) {
      let sub_exps = AccountTypes.Expenses[sub_exp];
      let n = Object.keys(sub_exps).length;
      let expt = new TBody(n + 1, 4);
      expt[0][0].value = sub_exp + " expenses";

      let i = 0;
      let sub = 0;
      for (let sub_sub_exp in sub_exps) {
        expt[i][1].value = sub_sub_exp;
        let exp_code = sub_exps[sub_sub_exp];
        if (bals_acc[exp_code])sub += bals_acc[exp_code];
        expt[i][2].value = mF(bals_acc[exp_code])
        i++;
      }
      expt[i][1].value = "<span style='float: right'>Subtotal</span>";
      expt[i][2].value = mF(sub);
      expt[i][3].value = inc();

      table.appendChild(expt)
      total_exp += sub;
    }

    let gross_exp = new TBody(1, 4);
    gross_exp[0].merge(0, 1);
    gross_exp[0][0].value = "Total of all expenses (B) plus (C)";
    gross_exp[0][2].value = mF(total_exp);
    gross_exp[0][3].value = inc();
    table.appendChild(gross_exp);

    let profit = new TBody(1, 4);
    profit[0].merge(0, 1);
    profit[0][0].value = "<b>Net income</b> (A) less (D)<b style = 'float: right'>Profit and Loss</b>";
    profit[0][2].value = mF(income - total_exp);
    table.appendChild(profit);

  }
}

SvgPlus.defineHTMLElement(ProfitAndLoss);
