import {SvgPlus, SvgPath, Vector} from '../3.5.js'

class WorkPanel extends SvgPlus{
  constructor(id){
    if (id) super(id);
    else super('DIV');

    this.styles = {
      position: "relative"
    }

    this.leftBox = this.createChild("DIV", {
      class: 'box left',
      style: {
        position: 'absolute'
      }
    });
    this.rightBox = this.createChild("DIV", {
      class: 'box right',
      style: {
        position: 'absolute'
      }
    });

    this.padX = 50;
    this.clickPadX = 10;

    this.centerX = this.size.width/2;

    window.onresize = () => {
      this._size = this.getBoundingClientRect()
      this._positionElements();
    }
  }

  onmousedown(e){
    let x = this.screenToCenterX(e.x);
    let dt = Math.abs(x - this.centerX)
    if (dt < this.clickPadX) {
      this._move = true;
    }
  }
  onmouseup(){
    this._move = false;
  }
  onmouseleave(){
    this._move = false;
  }
  onmousemove(e){
    let x = this.screenToCenterX(e.x);
    let dt = Math.abs(x - this.centerX)
    if (dt < this.clickPadX) {
      e.preventDefault();
      this.styles = {cursor: "ew-resize"}
    }else{
      this.styles = {cursor: "auto"}
    }

    if (this._move) {
      this.centerX = x;
    }
  }

  get size(){
    return this.getBoundingClientRect();
  }

  screenToCenterX(value){
    let size = this.size;
    return value - size.x;
  }

  set centerX(value){
    if (value < this.padX || value > this.size.width - this.padX) return;
    this._centerX = value;
    this._positionElements();
  }
  get centerX(){return this._centerX;}

  set left(value){
    this.leftBox.appendChild(value);
    this._left = value;
  }
  set right(value){
    this.rightBox.appendChild(value);
    this._right = value;
  }

  _positionElements(){
    let x = this.centerX;
    let width = this.size.width;
    this.leftBox.styles = {
      top: 0,
      bottom: 0,
      left: 0,
      right: `${width - x}px`,
      "--width": `${x}px`
    }
    this.rightBox.styles = {
      top: 0,
      bottom: 0,
      right: 0,
      left: `${x}px`,
      "--width": `${width - x}px`
    }
  }

}

export {WorkPanel}
