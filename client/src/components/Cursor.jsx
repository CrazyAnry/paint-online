import React from "react";
import s from "../styles/cursor.module.scss";
import { useRef } from "react";
import { useEffect } from "react";

const Cursor = ({username, color, x, y}) => {
  const cursorRef = useRef()

  useEffect(() => {
    cursorRef.current.style.left = `${x}px`;
    cursorRef.current.style.top = `${y+15}px`;
  }, [x, y])

  return (
    <div ref={cursorRef} className={s.main}>
        <div style={{borderBottom: `26px solid ${color}`}} className={s.cursor}></div>
        <label className={s.username}>{username}</label>
    </div>
  );
};

export default Cursor;
