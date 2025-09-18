import React, { useState } from "react";
import s from "../styles/toolbar.module.scss";
import toolState from "../store/toolState";
import { useNavigate, useParams } from "react-router-dom";
import canvasState from "../store/canvasState";

const SettingBar = () => {
  const navigate = useNavigate();
  const params = useParams();

  const exitTheRoom = () => {
    canvasState.socket.send(
      JSON.stringify({
        method: "delete_cursor",
        username: canvasState.username,
        id: params.id,
      })
    );
    toolState.tool = null;
    toolState.inputFillColor = "#000000";
    toolState.inputStrokeColor = "#000000";
    toolState.inputLineWidth = 1;
    canvasState.setUsername("");
    canvasState.setCursorColor(null);
    canvasState.socket.close();
    navigate("/");
  };

  return (
    <div className={s.settingBar}>
      <div className={s.settingGroup}>
        <label htmlFor="line-width" className={s.label}>
          Толщина линии
        </label>
        <input
          onChange={(e) => {
            e.target.value >= 50
              ? toolState.setLineWidth(50)
              : toolState.setLineWidth(e.target.value);
          }}
          className={s.inputNumber}
          id="line-width"
          type="number"
          defaultValue={1}
          min={1}
          max={50}
        />
      </div>
      <div className={s.settingGroup}>
        <button className={s.roomExit} onClick={() => exitTheRoom()}>
          Выход
        </button>
      </div>
    </div>
  );
};

export default SettingBar;
