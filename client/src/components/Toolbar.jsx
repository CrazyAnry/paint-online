import React from "react";
import s from "../styles/toolbar.module.scss";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import canvasState from "../store/canvasState";
import Rect from "../tools/Rect";
import Eraser from "../tools/Eraser";
import Circle from "../tools/Circle";
import Line from "../tools/Line";
import { useParams } from "react-router-dom";

const Toolbar = () => {
  const params = useParams();
  const download = () => {
    const dataUrl = canvasState.canvas.toDataURL();
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = canvasState.sessionId + ".jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={s.toolbar}>
      <button
        className={`${s.toolbar__btn} ${s.brush}`}
        onClick={() =>
          toolState.setTool(
            new Brush(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          )
        }
      />
      <button
        className={`${s.toolbar__btn} ${s.rect}`}
        onClick={() =>
          toolState.setTool(
            new Rect(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          )
        }
      />
      <button
        className={`${s.toolbar__btn} ${s.circle}`}
        onClick={() =>
          toolState.setTool(
            new Circle(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          )
        }
      />
      <button
        className={`${s.toolbar__btn} ${s.eraser}`}
        onClick={() =>
          toolState.setTool(
            new Eraser(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          )
        }
      />
      <button
        className={`${s.toolbar__btn} ${s.line}`}
        onClick={() =>
          toolState.setTool(
            new Line(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          )
        }
      />
      <input
        className={s.colorInput}
        type="color"
        onChange={(e) => toolState.setFillColor(e.target.value)}
      />
      <button
        className={`${s.toolbar__btn} ${s.undo}`}
        onClick={() => canvasState.undo(params.id)}
      />
      <button
        className={`${s.toolbar__btn} ${s.redo}`}
        onClick={() => canvasState.redo(params.id)}
      />
      <button
        className={`${s.toolbar__btn} ${s.save}`}
        onClick={() => download()}
      />
    </div>
  );
};

export default Toolbar;
