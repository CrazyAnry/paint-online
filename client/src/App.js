import React from "react";
import './styles/app.scss'
import Toolbar from "./components/Toolbar";
import SettingBar from "./components/SettingBar";
import Canvas from "./components/Canvas";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./components/HomePage";
import Auth from "./components/Auth";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/:id" element={
            <>
              <Toolbar /> 
              <SettingBar />
              <Canvas />
            </>
          }/>
        <Route path="/auth" element={<Auth/>}/>
        <Route path="/" element={<HomePage/>}/>
        </Routes>
        
        {/* <Navigate to={`f${(+new Date()).toString(16)}`}></Navigate> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
