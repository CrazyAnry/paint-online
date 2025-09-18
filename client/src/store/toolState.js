import { makeAutoObservable } from 'mobx'

class ToolState {
    tool = null
    inputFillColor = "#000000"
    inputStrokeColor = "#000000"
    inputLineWidth = 1
    setInputColorFunc = null

    constructor() {
        makeAutoObservable(this)
    }

    setInputColor(func){
        this.setInputColorFunc = func
    }

    setTool(tool) {
        this.tool = tool
    }

    setFillColor(color) {
        this.tool.fillColor = color
        this.inputFillColor = color
    }

    setStrokeColor(color) {
        this.tool.strokeColor = color
        this.inputStrokeColor = color
    }

    setLineWidth(width) {
        this.tool.lineWidth = width
        this.inputLineWidth = width
    }
}

export default new ToolState()