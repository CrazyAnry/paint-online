import React, { useState } from "react";
import s from "../styles/toolbar.module.scss";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import canvasState from "../store/canvasState";
import Rect from "../tools/Rect";
import Eraser from "../tools/Eraser";
import Circle from "../tools/Circle";
import Line from "../tools/Line";
import { useParams } from "react-router-dom";
import Fill from "../tools/Fill";
import Pipette from "../tools/Pipette";

const Toolbar = () => {
  const params = useParams();
  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000")

  useState(() => {
    toolState.setInputColor(setColor)
  }, [])
  
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
        className={`${s.toolbar__btn} ${s.brush} ${
          tool === "brush" && s.activeTool
        }`}
        onClick={() => {
          toolState.setTool(
            new Brush(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          );
          setTool("brush");
        }}
      />
      <button
        className={`${s.toolbar__btn} ${s.rect} ${
          tool === "rect" && s.activeTool
        }`}
        onClick={() => {
          toolState.setTool(
            new Rect(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          );
          setTool("rect");
        }}
      />
      <button
        className={`${s.toolbar__btn} ${s.circle} ${
          tool === "circle" && s.activeTool
        }`}
        onClick={() => {
          toolState.setTool(
            new Circle(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          );
          setTool("circle");
        }}
      />
      <button
        className={`${s.toolbar__btn} ${s.eraser} ${
          tool === "eraser" && s.activeTool
        }`}
        onClick={() => {
          toolState.setTool(
            new Eraser(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          );
          setTool("eraser");
        }}
      />
      <button
        className={`${s.toolbar__btn} ${s.line} ${
          tool === "line" && s.activeTool
        }`}
        onClick={() => {
          toolState.setTool(
            new Line(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          );
          setTool("line");
        }}
      />
      <button
        className={`${s.toolbar__btn} ${s.fill} ${
          tool === "fill" && s.activeTool
        }`}
        onClick={() => {
          toolState.setTool(
            new Fill(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          );
          setTool("fill");
        }}
      />
      <button
        className={`${s.toolbar__btn} ${s.pipette} ${
          tool === "pipette" && s.activeTool
        }`}
        onClick={() => {
          toolState.setTool(
            new Pipette(
              canvasState.canvas,
              canvasState.socket,
              canvasState.sessionId
            )
          );
          setTool("pipette");
        }}
      />
      <input
        className={s.colorInput}
        type="color"
        value={color}
        onChange={(e) => {
          toolState.setFillColor(e.target.value)
          toolState.setStrokeColor(e.target.value)
          setColor(e.target.value)
        }}
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
