import { makeAutoObservable } from "mobx";
import { axiosClient } from "../services";
import axios from "axios";

class CanvasState {
  canvas = null;
  undolist = [];
  redolist = [];
  username = "";
  socket = null;
  sessionId = null;
  cursorColor = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCursorColor(color) {
    this.cursorColor = color;
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

  async pushToUndo(data) {
    this.undolist.push(data);
    await axiosClient.post(`/history`, {
      roomId: this.sessionId,
      undo: this.undolist,
      redo: this.redolist,
    });
  }

  async pushToRedo(data) {
    this.redolist.push(data);
    await axiosClient.post(`/history`, {
      roomId: this.sessionId,
      undo: this.undolist,
      redo: this.redolist,
    });
  }

  setRedo(data) {
    this.redolist = [...data];
  }

  setUndo(data) {
    this.undolist = [...data];
  }

  async undo(params) {
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
      await axiosClient.post(`/image?id=${params}`, {
        img: dataUrl,
      });
      await axiosClient.post(`/history`, {
        roomId: params,
        undo: this.undolist,
        redo: this.redolist,
      });
    }
  }

  async redo(params) {
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
      await axiosClient.post(`/image?id=${params}`, {
        img: dataUrl,
      });
      await axiosClient.post(`/history`, {
        roomId: params,
        undo: this.undolist,
        redo: this.redolist,
      });
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
    this.redolist = [...redoArr];
    this.undolist = [...undoArr];
    let img = new Image();
    img.src = image;
    img.onload = () => {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    };
  }
}

export default new CanvasState();
