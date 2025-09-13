import toolState from "../store/toolState";
import Tool from "./Tool";

export default class Brush extends Tool {
  constructor(canvas, socket, id) {
    super(canvas, socket, id);
    this.listen();
  }

  listen() {
    this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    this.canvas.onmouseup = this.mouseUpHandler.bind(this);
    this.canvas.onmousedown = this.mouseDownHandler.bind(this);
    this.canvas.onmouseout = this.mouseUpHandler.bind(this);
  }

  mouseUpHandler() {
    if(this.mouseDown){
      this.mouseDown = false;
      this.socket.send(
        JSON.stringify({
          method: "draw",
          id: this.id,
          figure: {
            type: "finish",
          },
        })
      );
    }
  }

  mouseDownHandler(e) {
    this.mouseDown = true;
    this.ctx.beginPath();
    this.ctx.moveTo(
      e.pageX - e.target.offsetLeft,
      e.pageY - e.target.offsetTop
    );
  }

  mouseMoveHandler(e) {
    if (this.mouseDown) {
      this.socket.send(
        JSON.stringify({
          method: "draw",
          id: this.id,
          figure: {
            type: "brush",
            x: e.pageX - e.target.offsetLeft,
            y: e.pageY - e.target.offsetTop,
            fillStyle: this.ctx.fillStyle,
            strokeStyle: this.ctx.strokeStyle,
            lineWidth: this.ctx.lineWidth,
          },
        })
      );
    }
  }

  draw(x, y) {
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  static staticDraw(ctx, x, y, fillStyle, strokeStyle, lineWidth) {
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = toolState.inputFillColor;
    ctx.strokeStyle = toolState.inputStrokeColor;
    ctx.lineWidth = toolState.inputLineWidth;
  }
}
