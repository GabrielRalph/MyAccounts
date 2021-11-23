import {SvgPlus} from "../3.5.js";

function setCarrot(el, pos){
  var range = document.createRange()
  var sel = window.getSelection()

  range.setStart(el, pos)
  range.collapse(true)

  sel.removeAllRanges()
  sel.addRange(range)
}

String.prototype.insert = function(str, idx) {
    return this.slice(0, idx) + str + this.slice(idx);
};
String.prototype.remove = function(idx) {
    return this.slice(0, idx -1) + this.slice(idx);
};

function isChar(e) {
  return e.key.length < 3;
}

class TextInput extends SvgPlus{
  constructor(id) {
    super(id);
    this.styleElement = this;
    this.multiline = !!this.getAttribute("multiline");
    this.type = this.getAttribute("type");


    this._setEmpty(true);
    this.carretLock = false;
    this._valid = true;


    this.watch({subtree: true, characterData: true});
    this.addEventListener("focusout", () => {
      this._isfocus = true;
      if (this.carretLock) {
        this.carretLock = false;
      }
      if (this.empty) this.valid = true;
      // this.valid = this._validate(this.empty ? "" : this.value);
    });
    this.addEventListener("focusin", () => {
      this._isfocus = false;
      if (this.empty) {
        this.carretLock = true;
      }
    });
  }

  _allow(nextVal) {
    if (this.allow instanceof Function) {
      return this.allow(nextVal);
    }

    if (this.type == "number") {
      return nextVal == "" || nextVal == "-" || !Number.isNaN(parseFloat(nextVal));
    }
    // console.log(nextVal);
    return true;
  }

  _validate(nextVal) {
    let valid = nextVal == "" || this.empty;
    // console.log(this.type);
    if (this.type === "date" || this.type === "time") {
      valid = !Number.isNaN((new Date(nextVal)).getTime());
    }

    if (this.type === "number") {
      valid = !Number.isNaN(parseFloat(nextVal));
    }

    valid |= !this.type || this.type === "string";

    if (this.validate instanceof Function) {
      valid = this.validate(nextVal);
    }


    return valid;
  }

  onpaste(e){
    let paste = (event.clipboardData || window.clipboardData).getData('text');
    paste = paste.replace(/\s*$/, "");

    if (!this.multiline) paste = paste.replace("\n", "")

    let pos = window.getSelection().anchorOffset;
    let nextVal = this.value.insert(paste, pos);
    if (this._allow(nextVal)) {
      this.valid = this._validate(nextVal)

      //empty but past will make not empty
      if (this.empty && paste.length > 0) {
        this._setEmpty(false);
      }

      //insert text not formatted html
      document.execCommand("insertHTML", false, paste);
    }
    e.preventDefault();
  }

  onctrlz(e){
    e.preventDefault();
  }

  onkeydown(e){
    if (e.key == "Meta" || e.ctrlKey) {
      this._ctrl = true;
      return;
    }

    // Modifiers valid: v (paste) c (coppy) a (select all) x (cut) z (undo)
    if (this.ctrl) {
      if (e.key == "v" || e.key == "c" || e.key == "a" || e.key == "x" || e.key == "z") {
        if (e.key == "z") {
          this.onctrlz(e)
        }
      }else {
        e.preventDefault();
      }
      return;
    }


    // get the next value
    let nextVal = this.value;
    let pos = window.getSelection().anchorOffset;
    if (isChar(e)) {
      if (this.empty) {
        nextVal = e.key;
      }else {
        nextVal = nextVal.insert(e.key, pos);
      }
    } else {
      if (this.empty) {
        if (e.key == "Backspace") {
          e.preventDefault();
          return;
        }
      } else {
        nextVal = nextVal.remove(pos);
      }
    }

    //tab leave element
    if (e.key == "Tab") {
      this.carretLock = false;
      return;
    }

    //if not multiline block enter
    if (!this.multiline) {
      if (e.key == "Enter") {
        e.preventDefault();
        return;
      }
    }


    if ((this.empty && !isChar(e)) || !this._allow(nextVal)) {
      e.preventDefault()
      return;
    }

    // no longer empty
    if (this.empty && nextVal.length > 0) {
      this._setEmpty(false);
    }

    this.valid = this._validate(nextVal);
  }

  onkeyup(e){
    if (e.key == "Meta" || e.ctrlKey) {
      this._ctrl = false;
    }
  }

  onmutation(){
    if (this.length == 0) {
      this._setEmpty(true);
    }

    if (this.onchange instanceof Function) {
      this.onchange(this.value);
    }
  }

  set carretLock(locked){
    if (locked && !this._lock) {
      this._lock = true;

      let next = () => {
        if (this._lock) {
          setCarrot(this, 0);
          window.requestAnimationFrame(next)
        }
      }
      window.requestAnimationFrame(next)
    } else if (!locked && this._lock) {
      this._lock = false;
    }
  }
  get carretLock() {
    return this._lock;
  }

  set valid(value) {
    let el = this.styleElement;
    if (value) {
      if (!!el.class) {
        el.class = el.class.replace(/\s*invalid/, "");
      }
    } else {
      if (!el.class) {
        el.class = "invalid";
      } else if(el.class.indexOf("invalid") == -1) {
        el.class += " invalid";
      }
    }
    this._valid = value;
  }
  get valid(){
    return this._valid;
  }

  get empty() {
    return this._empty;
  }
  get length(){
    return this.value.length;
  }
  get ctrl(){
    return this._ctrl;
  }
  get isfocus(){
    return !!this._isfocus;
  }

  get value(){
    if (this.empty) return "";
    let getText = (el) => {
      if (el.nodeType == 3) {
        return el.data;
      }else {
        let text = "";
        for (let child of el.childNodes) {
          text += getText(child);
        }
        return text;
      }
    }
    return getText(this);
  }
  set value(value){
    value = value === 0 ? "" : value;
    if (value == null || value == "") {
      this.innerHTML = "&nbsp;";
      this._setEmpty(true);
      if (!this.isfocus) this.carretLock = false;
    } else{
      this._setEmpty(false);
      this.innerHTML = value;
    }
  }

  set edit(value){
    let el = this.styleElement;
    if (value) {
      if (!el.class) {
        el.class = "edit";
      } else if(el.class.indexOf("edit") == -1) {
        el.class += " edit";
      }
    } else {
      this.blur();
      if (!!el.class) {
        el.class = el.class.replace(/\s*edit/, "");
      }
    }

    this.props = {contenteditable: value}
  }
  get edit(){
    return this.getAttribute("contenteditable");
  }



  _setEmpty(value) {
    if (value) {
      this.valid = true;
      this.innerHTML = "&nbsp;";
      this.carretLock = true;
      this._empty = true;
    } else {
      this.innerHTML = "";
      this.carretLock = false;
      this._empty = false;
    }
  }
}

class Suggestions{
  constructor(strings){
    let min = 2;
    let Sgs = [];
    let SgsMap = {};
    for (let string of strings) {
      if (typeof string === "string" && string.length > min) {
        Sgs.push(string);
      }
    }
    Sgs = Sgs.sort((a, b) => a.length < b.length ? 1 : -1);
    for (let string of Sgs) {
      for (let i = min; i < string.length; i++) {
        SgsMap[string.slice(0, i)] = string;
      }
    }
    console.log(SgsMap);

    this.suggest = (text) => {
      if (text in SgsMap) {
        return SgsMap[text];
      }
      return "";
    }
  }
}

class TextField extends SvgPlus{
  constructor(id){
    super(id);
    this.class = "text-field"

    let rel = this.createChild("div", {styles: {
      width: "100%",
      height: "100%",
      position: "relative",
    }});
    this.suggestion_el = rel.createChild("div", {
      class: "suggestion",
      styles: {
        position: "absolute",
        "z-index": -1
      }
    });
    this.placeholder_el = rel.createChild("div", {
      class: "placeholder",
      styles: {
        position: "absolute",
        "z-index": -1
      }
    });

    this.input = new TextInput("div");
    this.input.styleElement = this;
    this.input.onchange = (value) => {this.change(value)}
    this.input.class = "input";
    this.input.edit = true;

    rel.appendChild(this.input);

    let focus = false;
    let fade = false;
    let nextFocus = false;

    this.input.addEventListener("focusin", () => {
      nextFocus = true;
    })
    this.input.addEventListener("focusout", () => {
      nextFocus = false;
    })

    let next = () => {
      if (this.empty) {

        if (focus != nextFocus) {
          this.placeFade(nextFocus);
          focus = nextFocus;
        }
      }
      window.requestAnimationFrame(next);
    }
    window.requestAnimationFrame(next);
  }

  placeFade(val) {
    let fader = (t) => {
      this.styles = {
        "--place-state": t,
      }
    }
    this.waveTransistion(fader, 300, val);
  }

  onkeydown(e){
    if (e.key == "Enter" || e.key == "Tab") {
      if (this._sgstns instanceof Suggestions) {
        let sug = this._sgstns.suggest(this.value);
        if (sug != "") {
          this.value = sug;
          this.suggestion = "";
          this.input.blur();
        }
      }
      if (e.key == "Enter") {
        if (this.nextField) {
          setCarrot(this.nextField.input, 0)
        }
      }
    }
  }

  change(value){
    this.suggestion = this.suggest(value);
    if (this.onchange instanceof Function) {
      this.onchange(value);
    }
  }

  suggest(value) {
    let sgs = "";
    if (this._sgstns instanceof Suggestions) {
      sgs = this._sgstns.suggest(value);
    }
    return sgs;
  }
  set suggestions(words) {
    this._sgstns = new Suggestions(words);
  }
  set suggestion(value){
    this.suggestion_el.innerHTML = value;
  }
  get suggestion(){
    return this.suggestion_el.innerHTML;
  }

  set placeholder(value){
    this.placeholder_el.innerHTML = value;
  }
  get placeholder(){
    return this.placeholder_el.innerHTML;
  }

  set validate(func) {
    this.input.validate = func;
  }

  set value(value){
    if (value <= 0) value = "";
    if (this.empty && value != "") {
      this.placeFade(true);
      setTimeout(() => {
        this.input.value = value;
      }, 150);
    }else {
      this.input.value = value;
    }
  }
  get value(){
    return this.input.value;
  }

  get empty() {
    return this.input.empty;
  }

  set type(value){
    this.input.type = value;
  }
  get type(){
    return this.input.type;
  }

  set edit(val) {
    this.input.edit = val;
  }
}

export {TextField, TextInput}
