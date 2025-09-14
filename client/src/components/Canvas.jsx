import React, { useEffect, useRef, useState } from "react";
import s from "../styles/canvas.module.scss";
import { observer } from "mobx-react-lite";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import { useNavigate, useParams } from "react-router-dom";
import Rect from "../tools/Rect";
import axios from "axios";
import Circle from "../tools/Circle";
import Eraser from "../tools/Eraser";
import Line from "../tools/Line";
import Message from "./Message";
import { axiosClient } from "../services";

const Canvas = observer(() => {
  const canvasRef = useRef();
  const params = useParams();
  const navigate = useNavigate();
  const [online, setOnline] = useState(0);
  const [chat, setChat] = useState([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    localStorage.getItem('username') && canvasState.setUsername(localStorage.getItem('username'))
    if (canvasState.username) {
      canvasState.setCanvas(canvasRef.current);
      axiosClient.get(`/image?id=${params.id}`).then((res) => {
        try{
          if (res.data) {
            const img = new Image();
            let ctx = canvasRef.current.getContext("2d");
            img.src = res.data;
            img.onload = () => {
              ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              );
              ctx.drawImage(
                img,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              );
              ctx.stroke();
            };
          } 
        } catch(e){
          return
        } 
      });
    } else if (!canvasState.username) {
      navigate("/auth");
    }
  }, []);

  useEffect(() => {
    if (canvasState.username) {
      const socket = new WebSocket("ws://localhost:5000");
      canvasState.setSocket(socket);
      canvasState.setSessionId(params.id);
      toolState.setTool(new Brush(canvasRef.current, socket, params.id));
      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            id: params.id,
            username: canvasState.username,
            method: "connection",
          })
        );
      };
      socket.onmessage = (event) => {
        let msg = JSON.parse(event.data);
        switch (msg.method) {
          case "connection":
            console.log(`Пользователь ${msg.username} подключился`);
            break;

          case "draw":
            drawHandler(msg);
            break;

          case "pictureActions":
            actionsHandler(msg);
            break;

          case "chatMessage":
            chatHandler(msg);
            break;
        }
        setOnline(msg.online)
      };
    }
  }, []);

  const chatHandler = (msg) => {
    setChat(prev => [...prev, {username: msg.username, content: msg.content}])
  };

  const actionsHandler = (msg) => {
    const action = msg.action;
    switch (action.type) {
      case "redo":
        canvasState.wsRedo(action.redoArr, action.undoArr, action.imageNow);
        break;
      case "undo":
        canvasState.wsUndo(action.redoArr, action.undoArr, action.imageNow);
        break;
    }
  };

  const drawHandler = (msg) => {
    const figure = msg.figure;
    const ctx = canvasRef.current.getContext("2d");
    switch (figure.type) {
      case "brush":
        Brush.staticDraw(
          ctx,
          figure.x,
          figure.y,
          figure.fillStyle,
          figure.strokeStyle,
          figure.lineWidth
        );
        break;

      case "rect":
        Rect.staticDraw(
          ctx,
          figure.x,
          figure.y,
          figure.width,
          figure.height,
          figure.fillStyle,
          figure.strokeStyle,
          figure.lineWidth
        );
        break;

      case "circle":
        Circle.staticDraw(
          ctx,
          figure.x,
          figure.y,
          figure.height,
          figure.fillStyle,
          figure.strokeStyle,
          figure.lineWidth
        );
        break;

      case "line":
        Line.staticDraw(
          ctx,
          figure.startX,
          figure.startY,
          figure.x,
          figure.y,
          figure.fillStyle,
          figure.strokeStyle,
          figure.lineWidth
        );
        break;

      case "eraser":
        Eraser.staticDraw(ctx, figure.x, figure.y, figure.lineWidth);
        break;

      case "finish":
        ctx.beginPath();
        break;
    }
  };

  const mouseDownHandler = () => {
    canvasState.pushToUndo(canvasRef.current.toDataURL());
  };

  const mouseUpHandler = async () => {
    await axiosClient.post(`/image?id=${params.id}`, {
      img: canvasRef.current.toDataURL(),
    });
  };

  const messageSend = () => {
    canvasState.socket.send(
      JSON.stringify({
        id: params.id,
        username: canvasState.username,
        content: message,
        method: "chatMessage"
      })
    )
    setMessage("")
  }

  return (
  <div className={s.canvas}>
    <canvas
      onMouseUp={() => mouseUpHandler()}
      onMouseDown={() => mouseDownHandler()}
      ref={canvasRef}
      width={600}
      height={400}
      className={s.canvasElement}
    />
    <div className={s.block}>
      <div className={s.header}>
        <h2 className={s.roomID}>Комната: {params.id}</h2>
        <div className={s.online}>
          <span className={s.onlineDot}></span>
          Онлайн: {online}
        </div>
      </div>
      <div className={s.chat}>
        {chat.map((el, index) => 
          <Message key={index} username={el.username} content={el.content} />
        )}
      </div>
      <div className={s.chatInp}>
        <input 
          value={message} 
          type="text" 
          placeholder="Введите сообщение..." 
          onChange={(e) => setMessage(e.target.value)}
          className={s.inputField}
          onKeyDown={(e) => e.key === 'Enter' && messageSend()}
        />
        <button onClick={() => messageSend()} className={s.sendButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
);
});

export default Canvas;
