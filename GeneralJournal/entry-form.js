import {SvgPlus} from "../SvgPlus/4.js"
import { InputPlus } from "../Utilities/input-plus.js"
import {Icon} from "../Utilities/Icons.js"
import {TBody, Tr, Td} from "../Utilities/Table.js"
import {makeProps} from "../Utilities/props.js"
import {EntryProps, dF} from "../gj.js"

const SuggestionCats = {
  "description": "names",
  "debit-acc": "accounts",
  "credit-acc": "accounts"
}
function getSS (val) {
  let res = ""
  if (val in SuggestionCats) {
    res = SuggestionCats[val];
  }
  return res;
}

class EntryForm extends SvgPlus{
  constructor(el) {
    super(el);
  }

  onconnect(){
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

    this.createChild("table").appendChild(body);
    let icons = this.createChild("div");

    let cross = icons.createChild(Icon);
    cross.icon = "cross";
    cross.onclick = () => {this.original = null}

    let trash = icons.createChild(Icon)
    trash.icon = "trash";
    trash.onclick = () => {
      const event = new Event("update");
      event.key = this.getAttribute("key");
      event.data = null;
      this.dispatchEvent(event);
      this.original = null;
    }

    let tick = icons.createChild(Icon)
    tick.icon = "tick";
    tick.onclick = () => {
      const event = new Event("update");
      event.key = this.getAttribute("key");
      event.data = this.edit;
      this.dispatchEvent(event);
      this.original = null;
    }

    let add = icons.createChild(Icon)
    add.icon = "add";
    add.onclick = () => {
      const event = new Event("update");
      event.key = null;
      event.data = this.edit;
      this.dispatchEvent(event);
      this.original = null;
    }

    this.body = body;
    this.original = {}
    let inputs = this._createInputs(body);
    inputs.date.validate = (val) => this.dateValidate(val);
    inputs.debit.addEventListener("focusout", () => this.creditAutoFill(inputs.debit.value));
    this.inputs = inputs;
    this.change();
  }

  creditAutoFill(val) {
    if (this.inputs.credit.empty && !this.inputs.debit.empty) {
      this.inputs.credit.value = parseFloat(this.inputs.debit.value) + "";
    }
  }

  change(){
    let edit = this.edit;
    let isChange = false;
    let original = this.original;
    for (let key in original) {
      if (original[key] != edit[key]){
        let type = EntryProps[key].type;
        if (type == "date" || type == "time") {
          let dt = Math.abs(edit[key] - original[key])/(1000*60*60*24);
          if (dt > 1) {
            isChange = true;
            break;
          }
        }else{
          isChange = true;
          break;
        }
      }
    }

    let empty = true;
    for (let key in this.inputs) {
      empty &= this.inputs[key].empty;
    }

    let bools = {
      invalid: (edit.date == -1) || (edit.credit == -1) || (edit.debit == -1) || (edit["credit-acc"] == "") || (edit["debit-acc"] == ""),
      empty: empty,
      changed: isChange
    }
    for (let key in bools) {
      if (bools[key]) {
        let p = {};
        p[key] = "";
        this.props = p;
      }else {
        this.removeAttribute(key);
      }
    }


    this._hasChanged = isChange;

    const event = new Event("change");
    this.dispatchEvent(event);
  }

  _createInputs(body) {
    this.props = {"invalid": ""}


    let inputs = {};
    let r = 0;
    for (let row of this.layout) {
      let c = 0;
      for (let elem of row) {
        let type = EntryProps[elem].type;
        let input = body[r][c].createChild(InputPlus, {
          events: {
            change: this.change.bind(this)
          }
        }, {
          type: type,
          placeholder: elem,
          "suggestion-category": getSS(elem)
        });
        inputs[elem] = input;
        c++;
      }
      r++;
    }
    return inputs
  }

  set original(data){
    if (typeof data !== "object" || data == null) {
      this._original = {json: null};
    } else {
      let props = makeProps(EntryProps, data);
      this._original = props;
    }
    this.setKey(null);
    this.edit = this.original;
    this.change();
  }
  get original(){
    return this._original.json;
  }

  get edit(){
    let vals = {};
    for (let name in this.inputs) vals[name] = this.inputs[name].value;
    return makeProps(EntryProps, vals).json;
  }
  set edit(value){
    for (let nm in this.inputs) {
      let v = "";
      if (value != null && nm in value) {
        let type = this.inputs[nm].type;
        v = value[nm];
        if (type == "date" || type == "time") {
          v = dF(v);
        }
        if (v === 0) v = "";
      }
      this.inputs[nm].value = v;
    }
  }

  setKey(value){
    if (value != null) {
      this.props = {"key": value}
    }else {
      this.removeAttribute("key");
    }
  }

  get hasChanged(){

    return this._hasChanged;
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

SvgPlus.defineHTMLElement(EntryForm)
