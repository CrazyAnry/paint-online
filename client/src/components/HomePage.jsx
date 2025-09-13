import React, { useRef, useState } from "react";
import s from "../styles/homepage.module.scss";
import canvasState from "../store/canvasState";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [room, setRoom] = useState("");

  return (
    <div className={s.main}>
      <h2 className={s.brand}>Paint-online</h2>
      <div className={s.form}>
        <div className={s.block}>
          <h3>Введите код комнаты для присоединения</h3>
          <input
            type="text"
            placeholder="Код комнаты"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        <button className={s.submit} onClick={() => navigate(`/${room}`)}> Подтвердить </button>
        </div>
        <div className={s.block}>
          <h3>Создать новую комнату</h3>
          <button
            className={s.submit}
            onClick={() => navigate(`/${(+new Date()).toString(16)}`)}
          > Подтвердить </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
