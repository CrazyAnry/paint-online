const { Client } = require("pg");
const express = require("express");
const app = express();
const WSSserver = require("express-ws")(app);
const aWss = WSSserver.getWss();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtAuth } = require("./middlewares");
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh-secret";

app.use(cors());
app.use(express.json());

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "paint",
  password: "1234",
  port: 5432,
});

client.connect((err) => {
  if (err) {
    console.log("PostgreSQL error");
  } else {
    console.log("PostgreSQL has been connected");
  }
});

app.ws("/", jwtAuth, (ws, req) => {
  ws.on("message", async (msg) => {
    msg = JSON.parse(msg);
    switch (msg.method) {
      case "connection":
        connectionHandler(ws, msg);
        break;
      case "draw":
        connectionHandler(ws, msg);
        break;
      case "pictureActions":
        connectionHandler(ws, msg);
        break;
      case "chatMessage":
        connectionHandler(ws, msg);
        break;
      case "close_connection":
        await fetch("http://localhost:5000/online", {
          method: "POST",
          body: {
            id: msg.id,
            method: "disconnect",
          },
        });
        connectionHandler(ws, msg);
        break;
    }
  });
});

app.post("/image", jwtAuth, (req, res) => {
  try {
    const data = req.body.img.replace("data:image/png;base64,", "");
    fs.writeFileSync(
      path.resolve(__dirname, "files", `${req.query.id}.jpg`),
      data,
      "base64"
    );
    return res.status(200).json({ message: "success" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "error" });
  }
});

app.get("/image", jwtAuth, (req, res) => {
  try {
    const file = fs.readFileSync(
      path.resolve(__dirname, "files", `${req.query.id}.jpg`)
    );
    if (file) {
      const data = "data:image/png;base64," + file.toString("base64");
      res.status(200).json(data);
    }
  } catch (e) {
    console.log(e);
    return res.status(200).json({ data: null });
  }
});

app.post("auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, "asjuduu32");
    await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    const accessToken = jwt.sign(
      {
        userId: currentUser.rows[1].id,
        username: user.username,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "7h" }
    );

    const refreshToken = jwt.sign(
      {
        userId: currentUser.rows[1].id,
        username: user.username,
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      message: "Registration successful",
      tokens: {
        accessToken,
        refreshToken,
      },
      user: {
        id: currentUser.rows[1].id,
        username,
      },
    });
  } catch (e) {
    console.log(e);
  }
});

app.get("auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const currentUser = client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (currentUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        currentUser.rows[1].password
      );

      if (isPasswordValid) {
        const accessToken = jwt.sign(
          {
            userId: currentUser.rows[1].id,
            username: user.username,
          },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "7h" }
        );

        const refreshToken = jwt.sign(
          {
            userId: currentUser.rows[1].id,
            username: user.username,
          },
          REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        res.send({
          message: "Login successful",
          tokens: {
            accessToken,
            refreshToken,
          },
          user: {
            id: currentUser.rows[1].id,
            username,
          },
        });
        return;
      }
      res.send({ message: "Неверный пароль" });
      return;
    }
    res.send({ message: "Пользователь не найден" });
  } catch (e) {
    console.log(e);
  }
});

app.post("/refresh", (req, res) => {
  try{
    const { refreshToken } = req.body;
    const validToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign(
      {
        userId: validToken.userId,
        username: validToken.username,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "7h" }
    );
    res.send({
      tokens: {
        refreshToken,
        accessToken
      }
    })
  } catch(e) {
    console.log("Ошибка верификации " + e.message)
  }
});

const connectionHandler = (ws, msg) => {
  ws.id = msg.id;
  broadcastConnection(msg);
};

const broadcastConnection = (msg) => {
  let online = 0;
  aWss.clients.forEach((client) => client.id === msg.id && online++);
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      client.send(JSON.stringify({ ...msg, online }));
    }
  });
};

app.listen(PORT, () => console.log(`server has been started on PORT ${PORT}`));
