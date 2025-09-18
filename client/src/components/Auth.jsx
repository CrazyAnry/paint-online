import React, { useState } from "react";
import s from '../styles/auth.module.scss'
import { useNavigate } from "react-router-dom";
import canvasState from "../store/canvasState";
import axios from "axios";

const Auth = () => {
  const [activeBlock, setActiveBlock] = useState("login");
  const navigate = useNavigate();
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rePassword, setRePassword] = useState("")

  const authHandler = async () => {
    if(username.length >= 3 && password.length >= 5) {
      if(activeBlock === "login" || activeBlock === "register" && rePassword === password){        
        canvasState.setUsername(username)
        const response = await axios.post(`http://localhost:5000/auth/${activeBlock === "login" ? 'login' : 'register'}`, {
          username: username,
          password: password
        })
        if(response.data.tokens){
          localStorage.setItem('username', username)
          localStorage.setItem('accessToken', response.data.tokens.accessToken)
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken)
          localStorage.setItem('cursorColor', "#000")
          setUsername("")
          setPassword("")
          setRePassword("")
          navigate("/")
        } else if(response.data.message === "User with that username is already exists"){
          alert("Пользователь с таким ником уже существует")
        } else if(response.data.message === "Неверный пароль"){
          alert("Неверный пароль")
        } else {
          alert("Пользователь не найден")
        }
      } else {
        alert("Пароли должны быть одинаковыми")
      }
    } else if(username.length < 3){
      alert("Никнейм должен быть 3 или более символа")
    } else if(password.length < 5){
      alert("Пароль должен быть 5 или более символов")
    }
  }

  return (
    <div className={s.container}>
      <div className={s.main}>
        <div className={`${s.block} ${activeBlock === "login" ? s.active : s.inactive}`}>
          <h3>Авторизация</h3>
          <input className={s.inp} value={username} placeholder="Ваш никнейм" type="text" onChange={(e) => setUsername(e.target.value)}/>
          <input className={s.inp} value={password} placeholder="Пароль" type="password" onChange={(e) => setPassword(e.target.value)}/>
          <button className={s.btn} onClick={() => authHandler()}>Войти</button>
          <h5 className={s.txt} onClick={() => setActiveBlock("register")}>Нет аккаунта? Зарегистрироваться</h5>
        </div>
        <div className={`${s.block} ${activeBlock === "register" ? s.active : s.inactive}`}>
          <h3>Регистрация</h3>
          <input className={s.inp} value={username} placeholder="Придумайте никнейм" type="text" onChange={(e) => setUsername(e.target.value)}/>
          <input className={s.inp} value={password} placeholder="Придумайте пароль" type="password" onChange={(e) => setPassword(e.target.value)}/>
          <input className={s.inp} value={rePassword} placeholder="Повторите пароль" type="password" onChange={(e) => setRePassword(e.target.value)}/>
          <button className={s.btn} onClick={() => authHandler()}>Зарегистрироваться</button>
          <h5 className={s.txt} onClick={() => setActiveBlock("login")}>Есть аккаунт? Войти</h5>
        </div>
      </div>
    </div>
  );
};

export default Auth;