import React from "react";
import s from "../styles/toolbar.module.scss";
import toolState from "../store/toolState";

const SettingBar = () => {
  return (
    <div className={s.settingBar}>
      <div className={s.settingGroup}>
        <label htmlFor="line-width" className={s.label}>
          Толщина линии
        </label>
        <input
          onChange={(e) => toolState.setLineWidth(e.target.value)}
          className={s.inputNumber}
          id="line-width"
          type="number"
          defaultValue={1}
          min={1}
          max={50}
        />
      </div>
      <div className={s.settingGroup}>
        <label htmlFor="stroke-color" className={s.label}>
          Цвет обводки
        </label>
        <input
          onChange={(e) => toolState.setStrokeColor(e.target.value)}
          className={s.inputColor}
          id="stroke-color"
          type="color"
        />
      </div>
    </div>
  );
};

export default SettingBar;
