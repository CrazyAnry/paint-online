import React from "react";
import s from "../styles/canvas.module.scss";

const Message = ({username, content}) => {
  return (
    <div className={s.message}>
      <p className={s.username}>{username}:</p> 
      <div className={s.content}>
        <p>{content}</p>
      </div>
    </div>
  );
}

export default Message