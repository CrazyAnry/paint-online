import React from "react";
import s from "../styles/canvas.module.scss";

const Message = ({username, content}) => {
  return (
    <div className={s.message}>
      <p><p className={s.username}>{username}:</p> <p className={s.content}>{content}</p></p>
    </div>
  );
}

export default Message