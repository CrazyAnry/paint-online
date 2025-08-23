import { makeAutoObservable } from 'mobx'

class CanvasState {
    canvas = null
    undolist = []
    redolist = []
    username = ""

    constructor() {
        makeAutoObservable(this)
    }

    setCanvas(canvas) {
        this.canvas = canvas
    }

    setUsername(username) {
        this.username = username
    }

    pushToUndo(data) {
        this.undolist.push(data)
    }

    pushToRedo(data) {
        this.redolist.push(data)
    }

    undo() {
        let ctx = this.canvas.getContext('2d')
        if (this.undolist.length > 0) {
            let dataUrl = this.undolist.pop()
            this.redolist.push(this.canvas.toDataURL())
            let img = new Image()
            img.src = dataUrl
            img.onload = () => {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
                ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
            }
        } else {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }

    redo() {
        let ctx = this.canvas.getContext('2d')
        if (this.redolist.length > 0) {
            let dataUrl = this.redolist.pop()
            this.undolist.push(this.canvas.toDataURL())
            let img = new Image()
            img.src = dataUrl
            img.onload = () => {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
                ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
            }
        }
    }
}

export default new CanvasState()