import { makeAutoObservable } from "mobx";

class CanvasState {
  canvas = null;
  undolist = [];
  redolist = [];
  username = "";
  socket = null;
  sessionId = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  setUsername(username) {
    this.username = username;
  }

  setSocket(socket) {
    this.socket = socket;
  }

  setSessionId(sessionId) {
    this.sessionId = sessionId;
  }

  pushToUndo(data) {
    this.undolist.push(data);
  }

  pushToRedo(data) {
    this.redolist.push(data);
  }

  undo() {
    let ctx = this.canvas.getContext("2d");
    if (this.undolist.length > 0) {
      let dataUrl = this.undolist.pop();
      this.redolist.push(this.canvas.toDataURL());
      this.socket.send(
        JSON.stringify({
          method: "pictureActions",
          id: this.sessionId,
          action: {
            type: "undo",
            imageNow: dataUrl,
            undoArr: JSON.parse(JSON.stringify(this.undolist)),
            redoArr: JSON.parse(JSON.stringify(this.redolist)),
          },
        })
      );
      let img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      };
    }
  }

  redo() {
    let ctx = this.canvas.getContext("2d");
    if (this.redolist.length > 0) {
      let dataUrl = this.redolist.pop();
      this.undolist.push(this.canvas.toDataURL());
      this.socket.send(
        JSON.stringify({
          method: "pictureActions",
          id: this.sessionId,
          action: {
            type: "redo",
            imageNow: dataUrl,
            undoArr: JSON.parse(JSON.stringify(this.undolist)),
            redoArr: JSON.parse(JSON.stringify(this.redolist)),
          },
        })
      );
      let img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      };
    }
  }

  wsUndo(redoArr, undoArr, image) {
    let ctx = this.canvas.getContext("2d");
    this.redolist = redoArr.map((el) => el);
    this.undolist = undoArr.map((el) => el);
    let img = new Image();
    img.src = image;
    img.onload = () => {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    };
  }

  wsRedo(redoArr, undoArr, image) {
    let ctx = this.canvas.getContext("2d");
    this.redolist = redoArr.map((el) => el);
    this.undolist = undoArr.map((el) => el);
    let img = new Image();
    img.src = image;
    img.onload = () => {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    };
  }
}

export default new CanvasState();
