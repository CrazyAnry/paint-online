import toolState from "../store/toolState";
import Tool from "./Tool";

export default class Circle extends Tool {
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

  mouseDownHandler(e) {
      this.mouseDown = true;
      this.ctx.beginPath();
      this.startX = e.pageX - e.target.offsetLeft;
      this.startY = e.pageY - e.target.offsetTop;
      this.saved = this.canvas.toDataURL();
  }

  mouseUpHandler() {
    if(this.mouseDown){
      this.mouseDown = false;
      this.socket.send(
        JSON.stringify({
          method: "draw",
          id: this.id,
          figure: {
            type: "circle",
            x: this.startX,
            y: this.startY,
            height: this.height,
            fillStyle: this.ctx.fillStyle,
            strokeStyle: this.ctx.strokeStyle,
            lineWidth: this.ctx.lineWidth,
          },
        })
      );
    }
  }

  mouseMoveHandler(e) {
    if (this.mouseDown) {
      let currentY = e.pageY - e.target.offsetTop;
      this.height = currentY - this.startY;
      this.draw(this.startX, this.startY, this.height);
    }
  }

  draw(x, y, h) {
    const img = new Image();
    img.src = this.saved;
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();

      h <= 0
        ? this.ctx.arc(x, y, 1, 0, Math.PI * 2)
        : this.ctx.arc(x, y, h, 0, Math.PI * 2);

      this.ctx.fill();
      this.ctx.stroke();
    };
  }

  static staticDraw(ctx, x, y, h, fillStyle, strokeStyle, lineWidth) {
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    h <= 0
      ? ctx.arc(x, y, 1, 0, Math.PI * 2)
      : ctx.arc(x, y, h, 0, Math.PI * 2);

    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = toolState.inputFillColor;
    ctx.strokeStyle = toolState.inputStrokeColor;
    ctx.lineWidth = toolState.inputLineWidth;
  }
}
