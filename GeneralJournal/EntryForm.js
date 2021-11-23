import {SvgPlus} from "../3.5.js"
import {TextField} from "../InputPlus/input.js"
import {Icon} from "../SvgPlus/Icons.js"
import {TBody, Tr, Td} from "../SvgPlus/Table.js"
import {makeProps} from "../SvgPlus/props.js"
import {EntryProps, datef} from "./GeneralJournal.js"

class EntryForm extends SvgPlus{
  constructor(original = null) {
    super("table");
    this.class = "entry-form"

    let body = new TBody(5,2);
    body[0].merge(0,1);
    body[3].merge(0,1);
    body[4].merge(0,1);
    this.layout =
    [["date"],
     ["debit-acc", "debit"],
     ["credit-acc", "credit"],
     ["description"],
     ["lifespan"]
   ];

    this.original = original;
    this.appendChild(body);
    this.body = body;

    let inputs = this.fillBodyInputs(body);
    inputs.date.validate = (val) => this.dateValidate(val);
    inputs.debit.addEventListener("focusout", () => this.creditAutoFill(inputs.debit.value));
    this.inputs = inputs;
  }

  set edit(value){
    for (let nm in this.inputs) {
      this.inputs[nm].edit = value;
    }
  }

  set accountNames(value) {
    this.inputs["credit-acc"].suggestions = value;
    this.inputs["debit-acc"].suggestions = value;
  }

  dateValidate(val) {
    let date = new Date(val);
    let string = "date";
    let valid = val == "";


    if (!Number.isNaN(date.getTime())) {
      string += `: <p>${datef(date)}</p>`
      valid = true;
    }

    this.inputs.date.placeholder = string;
    return valid;
  }

  creditAutoFill(val) {
    if (this.inputs.credit.empty && !this.inputs.debit.empty) {
      console.log(parseFloat(this.inputs.debit.value));
      this.inputs.credit.value = parseFloat(this.inputs.debit.value) + "";
    }
  }

  change(){
    if (this.onchange instanceof Function) {
      this.onchange();
    }
  }

  fillBodyInputs(body) {
    let inputs = {};
    let r = 0;
    let original = this.original;
    let last = null;
    for (let row of this.layout) {
      let c = 0;
      for (let elem of row) {
        let input = new TextField("div");
        Object.assign(input, EntryProps[elem]);
        body[r][c].appendChild(input);
        let type = EntryProps[elem].type
        if (type === "date" || type === "time")
          input.value = datef(original[elem]);
        else
          input.value = original[elem];
        input.placeholder = elem;
        input.onchange = (nv) => {
          this.change();
        }
        inputs[elem] = input;
        if (last != null) {
          last.nextField = input;
        }
        last = input;
        c++;
      }
      r++;
    }

    inputs.lifespan.nextField = inputs.date;

    return inputs
  }

  set original(data){
    if (typeof data !== "object" || data == null) data = {};

    let props = makeProps(EntryProps, data);
    this._original = props;
  }
  get original(){
    return this._original.json;
  }

  get edit(){
    let vals = {};
    for (let name in this.inputs)vals[name] = this.inputs[name].value;
    return makeProps(EntryProps, vals).json;
  }

  get hasChanged(){
    let edit = this.edit;
    let original = this.original;
    for (let key in original) {
      if (original[key] != edit[key]){
        let type = EntryProps[key].type;
        if (type == "date" || type == "time") {
          let dt = Math.abs(edit[key] - original[key])/(1000*60*60*24);
          if (dt > 1) return true;
        }else{
          return true;
        }
      }
    }

    return false;
  }

  get valid(){
    let edit = this.edit;
    if (edit.date == -1) return false;
    if (edit.credit == -1) return false;
    if (edit.debit == -1) return false;
    if (edit["credit-acc"] == "") return false;
    if (edit["debit-acc"] == "") return false;
    return true;
  }
}

export {EntryForm}
