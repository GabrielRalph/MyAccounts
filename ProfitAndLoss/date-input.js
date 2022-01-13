import {SvgPlus} from "../SvgPlus/4.js"
import {dF} from "../gj.js"



class DateInput extends SvgPlus {
  constructor(el){
    super(el);
    this.output = this.createChild("input", {class: "output"});
    this.input = this.createChild("input", {class: "main"});

    this.input.addEventListener("focusin", () => {this.select()})
    this.input.addEventListener("focusout", () => {this.unselect()})
    this.input.addEventListener("keyup", (e) => {this.update(e)})
  }

  set value(date){
    this.input.value = dF(date);
    this.output.value = dF(date);
  }
  get value(){
    return this.input.value;
  }

  update(e){
    let date = new Date(this.value);
    this.output.value = dF(date);

    const event = new Event("value");
    this.dispatchEvent(event);
  }

  select(){
    this.output.class = "output selected"
    this.input.value = this.output.value;
  }

  unselect(){
    this.output.class = "output"
    this.input.value = this.output.value;
    const event = new Event("change");
    this.dispatchEvent(event);
  }
}

SvgPlus.defineHTMLElement(DateInput);
