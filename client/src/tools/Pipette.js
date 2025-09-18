import toolState from "../store/toolState";
import Tool from "./Tool";

export default class Pipette extends Tool {
  constructor(canvas, socket, sessionId) {
    super(canvas, socket, sessionId);
    this.listen();
  }

  listen() {
    this.canvas.onmouseup = this.mouseUpHandler.bind(this);
    this.canvas.onmousedown = this.mouseDownHandler.bind(this);
    this.canvas.onmouseout = this.mouseUpHandler.bind(this);
  }

  mouseUpHandler(e) {
    if (this.mouseDown) {
      this.mouseDown = false;
    }
  }

  mouseDownHandler(e) {
    this.mouseDown = true;
    this.startX = e.pageX - e.target.offsetLeft;
    this.startY = e.pageY - e.target.offsetTop;

    this.pipetteColor();
  }

  pipetteColor() {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const pixels = imageData.data;
    const startPos =
      (Math.floor(this.startY) * this.canvas.width + Math.floor(this.startX)) *
      4;

    const targetColor = {
      r: pixels[startPos],
      g: pixels[startPos + 1],
      b: pixels[startPos + 2],
      a: pixels[startPos + 3],
    };

    const toHex = (value) => {
      const hex = value.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    let targetColorHex = `#${toHex(targetColor.r)}${toHex(targetColor.g)}${toHex(targetColor.b)}`;

    
    toolState.setInputColorFunc(targetColorHex)
    toolState.setFillColor(targetColorHex);
    toolState.setStrokeColor(targetColorHex);
  }
}
