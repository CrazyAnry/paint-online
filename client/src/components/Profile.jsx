import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "../styles/profile.module.scss";
import { axiosClient } from "../services";

export const Profile = () => {
  const navigate = useNavigate();
  const [isChange, setIsChange] = useState(false);
  const [newName, setNewName] = useState(localStorage.getItem("username"));

  const exitAccount = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("cursorColor");
    navigate("/auth");
  };

  const updateName = async () => {
    if (newName.length >= 3) {
      const response = await axiosClient.put("/auth/rename", {
        newUsername: newName,
      });
      if (response.data.message === "Name has been changed") {
        localStorage.setItem("username", newName);
        const newTokens = await axiosClient.put("/tokens/new", {
          username: newName,
        });
        localStorage.setItem("accessToken", newTokens.data.tokens.accessToken);
        localStorage.setItem(
          "refreshToken",
          newTokens.data.tokens.refreshToken
        );
        setIsChange(false);
      } else {
        alert("Ошибка изменения");
      }
    } else {
      alert("Имя должно быть больше 3 символов");
    }
  };

  return (
    <div className={s.main}>
      <div className={s.profile}>
        <div className={s.avatar}></div>

        {isChange ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={s.nameInput}
          />
        ) : (
          <h1 className={s.username}>{localStorage.getItem("username")}</h1>
        )}

        {isChange ? (
          <div className={s.actions}>
            <button className={s.acceptBtn} onClick={() => updateName()}>
              Принять
            </button>
            <button
              className={s.cancelBtn}
              onClick={() => {
                setIsChange(false);
                setNewName(localStorage.getItem("username"));
              }}
            >
              Отменить
            </button>
          </div>
        ) : (
          <button className={s.changeBtn} onClick={() => setIsChange(true)}>
            Изменить имя
          </button>
        )}

        <label className={s.colorLabel}>Цвет вашего курсора</label>
        <input
          defaultValue={localStorage.getItem("cursorColor") || "#4cc9f0"}
          onChange={(e) => localStorage.setItem("cursorColor", e.target.value)}
          className={s.colorInput}
          type="color"
        />

        <button className={s.exitBtn} onClick={() => exitAccount()}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};
