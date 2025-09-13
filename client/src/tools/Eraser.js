import toolState from "../store/toolState";
import Brush from "./Brush";

export default class Eraser extends Brush {
  constructor(canvas, socket, sessionId) {
    super(canvas, socket, sessionId);
  }

  mouseMoveHandler(e) {
    if (this.mouseDown) {
      this.socket.send(
        JSON.stringify({
          method: "draw",
          id: this.id,
          figure: {
            type: "eraser",
            x: e.pageX - e.target.offsetLeft,
            y: e.pageY - e.target.offsetTop,
            lineWidth: this.ctx.lineWidth,
          },
        })
      );
    }
  }

  draw(ctx, x, y) {
    ctx.strokeStyle = "white";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  static staticDraw(ctx, x, y, lineWidth) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "white";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = toolState.inputFillColor;
    ctx.strokeStyle = toolState.inputStrokeColor;
    ctx.lineWidth = toolState.inputLineWidth;
  }
}
