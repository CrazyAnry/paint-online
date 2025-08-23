import Rect from "./Rect";

export default class Circle extends Rect {
    constructor(canvas) {
        super(canvas)
    }

    draw(x, y, w, h) {
        const img = new Image()
        img.src = this.saved
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
            this.ctx.beginPath()
            
            h <= 0 
            ? 
            this.ctx.arc(x, y, 1, 0, Math.PI * 2) 
            :
            this.ctx.arc(x, y, h, 0, Math.PI * 2)

            this.ctx.fill()
            this.ctx.stroke()
        }
    }
}