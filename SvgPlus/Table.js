import {SvgPlus, SvgPath, Vector} from './4.js'

class Td extends SvgPlus{
  constructor(){
    super("td");
  }

  get value(){
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

  set value(val){
    this.innerHTML = val;
  }

  clear(){
    this.innerHTML = "";
  }
}

class Tr extends SvgPlus{
  constructor(cells){
    super("tr");
    for (let c = 0; c < cells; c++) {
      this[c] = this.createChild(Td)
    }
  }

  merge(cs, ce){
    if (ce > this.children.length - 1) return;
    if (cs > ce) return;
    this[cs].props = {colspan: ce - cs+1};
    while (ce > cs) {
      this.removeChild(this[ce]);
      this[ce] = this[cs];
      ce--;
    }
  }
}


class THead extends SvgPlus{
  constructor(r, c) {
    super('THEAD');
    for (let row = 0; row < r; row++) {
      this[row] = new Tr(c);
      this.appendChild(this[row])
    }
  }

  set array(arr){
    let i = 0;
    for (let row of this.children) {
      let j = 0;
      for (let cell of row.children) {
        try {
          let value = arr[i][j];
          cell.value = value;
        } catch (e) {}
        j++;
      }
      i++;
    }
  }

  static fromArray(arr) {
    let thead = null;
    try {
      let r = arr.length;
      let c = arr[0].length;
      let thead = new THead(r, c);
      thead.array = arr;
    } catch (e) {
      thead = null;
    }
    return thead;
  }

}
class TBody extends SvgPlus{
  constructor(r, c) {
    super('TBODY');
    for (let row = 0; row < r; row++) {
      this[row] = new Tr(c);
      this.appendChild(this[row])
    }
  }

  set array(arr){
    let i = 0;
    for (let row of this.children) {
      let j = 0;
      for (let cell of row.children) {
        try {
          let value = arr[i][j];
          cell.value = value;
        } catch (e) {}
        j++;
      }
      i++;
    }
  }

  static fromArray(arr) {
    let tbody = null;
    try {
      let r = arr.length;
      let c = arr[0].length;
      tbody = new TBody(r, c);
      tbody.array = arr;
    } catch (e) {
      console.log("from array error");
      tbody = null;
    }
    return tbody;
  }
}


export {Td, Tr, THead, TBody}
