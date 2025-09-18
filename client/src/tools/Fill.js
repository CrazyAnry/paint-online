import { axiosClient } from "../services";
import Tool from "./Tool";

export default class Fill extends Tool {
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
      this.socket.send(
        JSON.stringify({
          method: "draw",
          id: this.id,
          figure: {
            type: "fill",
            x: this.startX,
            y: this.startY,
            startX: this.startX,
            startY: this.startY,
            color: this.ctx.fillStyle,
          },
        })
      );
    }
  }

  async mouseDownHandler(e) {
    await axiosClient.post(`/image?id=${this.sessionId}`, {
      img: this.canvas.toDataURL(),
    });
    this.mouseDown = true;
    this.startX = e.pageX - e.target.offsetLeft;
    this.startY = e.pageY - e.target.offsetTop;

    this.floodFill(this.startX, this.startY);
  }

  floodFill(startX, startY) {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const pixels = imageData.data;
    const startPos =
      (Math.floor(startY) * this.canvas.width + Math.floor(startX)) * 4;

    const targetColor = {
      r: pixels[startPos],
      g: pixels[startPos + 1],
      b: pixels[startPos + 2],
      a: pixels[startPos + 3],
    };

    const fillColor = this.hexToRgb(this.ctx.fillStyle);

    if (this.colorsEqual(targetColor, fillColor, 5)) return;

    const queue = [{ x: Math.floor(startX), y: Math.floor(startY) }];
    const visitedPixels = new Set();

    while (queue.length > 0) {
      const firstEl = queue.shift();
      const { x, y } = firstEl;
      const pos = (y * this.canvas.width + x) * 4;

      const key = `${x}, ${y}`;
      if (visitedPixels.has(key)) continue;
      visitedPixels.add(key);

      if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height)
        continue;

      const currentColor = {
        r: pixels[pos],
        g: pixels[pos + 1],
        b: pixels[pos + 2],
        a: pixels[pos + 3],
      };

      if (!this.colorsEqual(currentColor, targetColor, 5)) continue;

      pixels[pos] = fillColor.r;
      pixels[pos + 1] = fillColor.g;
      pixels[pos + 2] = fillColor.b;
      pixels[pos + 3] = fillColor.a;

      queue.push({ x: x + 1, y });
      queue.push({ x: x - 1, y });
      queue.push({ x, y: y + 1 });
      queue.push({ x, y: y - 1 });
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  hexToRgb(hex) {
    hex = hex.replace("#", "");

    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b, a: 255 };
  }

  colorsEqual(color1, color2, tolerance) {
    return (
      Math.abs(color1.r - color2.r) <= tolerance &&
      Math.abs(color1.g - color2.g) <= tolerance &&
      Math.abs(color1.b - color2.b) <= tolerance &&
      Math.abs(color1.a - color2.a) <= 100
    );
  }

  static staticDraw(canvas, ctx, x, y, color) {
    ctx.save();

    ctx.fillStyle = color;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const startPos = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
    const targetColor = {
      r: pixels[startPos],
      g: pixels[startPos + 1],
      b: pixels[startPos + 2],
      a: pixels[startPos + 3],
    };

    const fillColor = this.hexToRgbStatic(color);

    if (this.colorsEqualStatic(targetColor, fillColor, 5)) {
      ctx.restore();
      return;
    }

    const queue = [{ x: Math.floor(x), y: Math.floor(y) }];
    const visited = new Set();

    while (queue.length > 0) {
      const point = queue.shift();
      const { x, y } = point;
      const pos = (y * canvas.width + x) * 4;

      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

      const currentColor = {
        r: pixels[pos],
        g: pixels[pos + 1],
        b: pixels[pos + 2],
        a: pixels[pos + 3],
      };

      if (!this.colorsEqualStatic(currentColor, targetColor, 5)) continue;

      pixels[pos] = fillColor.r;
      pixels[pos + 1] = fillColor.g;
      pixels[pos + 2] = fillColor.b;
      pixels[pos + 3] = fillColor.a;

      queue.push({ x: x + 1, y });
      queue.push({ x: x - 1, y });
      queue.push({ x, y: y + 1 });
      queue.push({ x, y: y - 1 });
    }

    ctx.putImageData(imageData, 0, 0);

    ctx.restore();
  }

  static hexToRgbStatic(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b, a: 255 };
  }

  static colorsEqualStatic(color1, color2, tolerance) {
    return (
      Math.abs(color1.r - color2.r) <= tolerance &&
      Math.abs(color1.g - color2.g) <= tolerance &&
      Math.abs(color1.b - color2.b) <= tolerance &&
      Math.abs(color1.a - color2.a) <= 100
    );
  }
}
