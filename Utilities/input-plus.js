import {SvgPlus} from "../SvgPlus/4.js"
import {Types} from "./props.js"

function dF(date){
  if (date == -1) return "";
  let d = new Date(date);
  if (Number.isNaN(d.getTime())) return ""
  d = (""+d).split(" ");
  return `${d[2]} ${d[1]} ${d[3]}`;
}

class InputPlus extends SvgPlus{
  _type = "string";
  _suggestion_category = null;
  constructor(options){
    super("input-plus");
    this.onconnect();
    if (options){
      console.log(options);
      for (let key in options){
        if (key in this){
          this[key] = options[key];
        }
      }
    }
  }

  onconnect(){
    this.create();
  }

  create(){
    if (this._created) return;
    let value = this.innerHTML;
    this.innerHTML = "";
    let rel = this.createChild("div");
    this._placeholder = rel.createChild("div", {class: "placeholder"});
    this._placeholder_text = this._placeholder.createChild("span", {content: this.placeholder});
    this._placeholder_result = this._placeholder.createChild("span", {content: this.result});
    this._suggestion = rel.createChild("div", {class: "suggestion", content: this.suggestion});
    let meta = false;
    let input = rel.createChild("input", {events: {
      focusin: this._focusin.bind(this),
      focusout: this._focusout.bind(this),
      keyup: this._afterChange.bind(this),
      keydown: (event) => {
        let key = event.key;
        let v = this.value;
        let s = input.selectionStart;
        let e = input.selectionEnd;
        let nv = v;
        if (!meta) {
          if (key.length == 1) {
            if (v.length > 0) {
              nv = v.substring(0, s) + key + v.substring(e);
            } else {
              nv = key;
            }
          } else {
            meta = key == "Meta";
            if (key == "Backspace") {
              if (v.length > 0) {
                if (s == e) {
                  nv = v.substring(0, s-1) + v.substring(e);
                } else {
                  nv = v.substring(0, s) + v.substring(e);
                }
              }
            } else if (key == "Tab") {
              if (this.suggestion.length > 0) {
                this.value = this.suggestion;
                this.suggestion = "";
              }
            }
          }
        }
        if (!this._beforeChange(nv)) {
          event.preventDefault();
        }
      },
      paste: (event) => {
        let data = event.clipboardData.getData('text/plain');
        let s = input.selectionStart;
        let e = input.selectionEnd;
        let v = this.value;
        let nv = v.substring(0, s) + data + v.substring(e);
        if (!this._beforeChange(nv)) {
          event.preventDefault();
        }
      },
      cut: (event) => {
        let s = input.selectionStart;
        let e = input.selectionEnd;
        let v = this.value;
        let nv = v.substring(0, s) + v.substring(e);
        if (!this._beforeChange(nv)) {
          event.preventDefault();
        }
      }
    }});
    this._rel = rel;
    this._input = input;
    this._created = true;
    this.value = value || this._value;
    if (value.length > 0) {
      this.setPhF(1)
    }
  }

  setPhF(value) {
    this._rel.styles = {"--placeholder-factor": value}
  }

  _beforeChange(newValue) {
    let v = this.parse(newValue);
    let allow = true;
    if (v == null && newValue.length > 0) {
      this.props = {invalid: ""};
    } else {
      this.removeAttribute("invalid")
    }

    switch (this.type) {
      case "string":
      break;

      case "time":
      this._placeholder_result.innerHTML = dF(newValue)
      break;

      case "date":
      this._placeholder_result.innerHTML = dF(newValue)
      break;

      case "number":
      let noLetters = newValue.replace(".", "").replace("-", "") == newValue.replace(/[^0-9e]/g, "");
      let isNumber = v != null;
      allow = newValue.length == 0 || newValue == "-" || (isNumber && noLetters);
      break;

      case "vector":
      if (v == null) v = "invalid"
      this._placeholder_result.innerHTML = v;
      break;
    }

    const event = new Event("beforeChange");
    event.change = newValue;
    this.dispatchEvent(event);
    return allow;
  }
  _afterChange(){
    this._check_suggestions();

    const cevent = new Event("change");
    this.dispatchEvent(cevent);
  }

  _focusin() {
    if (this.value.length == 0) {
      this.fadeOn = true;
      this.waveTransition((t) => {
        if (this.fadeOn) this.setPhF(t);
      }, 200, true)
    }
    const event = new Event("focusin");
    this.dispatchEvent(event);
  }
  _focusout() {
      
    if (this.value.length == 0) {
      this.fadeOn = true;
      this.waveTransition((t) => {
        if (this.fadeOn) this.setPhF(t)
      }, 200, false)
    }
    const event = new Event("focusout");
    this.dispatchEvent(event);
  }

  _check_suggestions(){
    console.log('xx');
    let suggestion = "";
    try {
      suggestion = document.suggestions.search(this.value, this.suggestion_category);
    } catch {}
    this.suggestion = suggestion;
  }

  set value(value){
    value = value ? value + "" : "";
    this._value = value;
    if (this._created){
      if (value.length > 0) {
        this.setPhF(1);
      } else {
        this.setPhF(0);
      }
      this._beforeChange(value)
      this.fadeOn = false;
      this._input.value = value;
    }
  }
  get value(){
    return this._input.value;
  }

  set placeholder(value){
    this._placeholder_value = value;
    if (this._created){
      this._placeholder_text.innerHTML = value;
    }
  }
  get placeholder(){
    return this._placeholder_value ? this._placeholder_value : "";
  }

  set suggestion_category(value){
    if (!value) value = null;
    this._suggestion_category = value;
  }

  set ["suggestion-category"](value){
    if (!value) value = null;
    this._suggestion_category = value;
  }
  get suggestion_category(){
    return this._suggestion_category;
  }

  set suggestion(value){
    if (!value) value = "";
    this._suggestion_value = value;
    if (this._created){
      this._suggestion.innerHTML = value;
    }
  }
  get suggestion(){
    return this._suggestion_value ? this._suggestion_value : "";
  }

  set result(value){
    if (!value) value = "";
    this._result_value = value;
    if (this._created){
      this._placeholder_result.innerHTML = value;
    }
  }
  get result(){
    return this._result_value ? this._result_value : "";
  }

  set type(value){
    if (value in Types) {
      this._type = value;
    }
  }
  get type(){
    return this._type;
  }

  get isValid(){
    return this.parse(this.value) != null;
  }
  get parse(){
    return Types[this._type].parse
  }

  get empty(){
    return this.value.length == 0;
  }
}


export {InputPlus}
