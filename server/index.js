import { Client } from "pg";
import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { jwtAuth } from "./middlewares.js";
import { v4 } from 'uuid';
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config()
const app = express();
const WSSserver = expressWs(app);
const aWss = WSSserver.getWss();

const PORT = process.env.PORT || 5000;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET =
process.env.REFRESH_TOKEN_SECRET || "refresh-secret";

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

app.ws("/", (ws, req) => {
  ws.on("message", async (msg) => {
    msg = JSON.parse(msg);
    if(msg.method === "connection"){
      connected(ws, msg)
    } else {
      broadcastConnection(ws, msg);
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

app.post("/history", jwtAuth, async (req, res) => {
  try{
    const {redo, undo, roomId} = req.body
    const roomHistory = await client.query("SELECT * FROM canvas_history WHERE room = $1", [roomId])
    if(roomHistory.rowCount !== 0)
      await client.query('UPDATE canvas_history SET "redo_arr" = $1, "undo_arr" = $2 WHERE room = $3', [redo, undo, roomId])
    else
      await client.query('INSERT INTO canvas_history (room, "redo_arr", "undo_arr") VALUES($1, $2, $3)', [roomId, redo, undo])

    return res.send({
      message: "room history saved successfuly"
    })
  } catch(e) {
    console.log(e)
  }
})

app.get("/history", jwtAuth, async (req, res) => {
  try {
    const { roomId } = req.query;
    
    const roomHistory = await client.query(
      'SELECT undo_arr, redo_arr FROM canvas_history WHERE room = $1', 
      [roomId]
    );

    if (roomHistory.rowCount !== 0) {
      return res.send({
        redoArr: roomHistory.rows[0].redo_arr || null,
        undoArr: roomHistory.rows[0].undo_arr || null
      });
    }

    return res.send({
      redoArr: null,
      undoArr: null
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server error");
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const findedUser = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (findedUser.rowCount === 0) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await client.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [username, hashedPassword]
      );

      const currentUser = await client.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      const accessToken = jwt.sign(
        {
          userId: currentUser.rows[0].id,
          username,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "7h" }
      );

      const refreshToken = jwt.sign(
        {
          userId: currentUser.rows[0].id,
          username,
        },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      return res.send({
        message: "Registration successful",
        tokens: {
          accessToken,
          refreshToken,
        },
        user: {
          id: currentUser.rows[0].id,
          username,
        },
      });
    }
    return res.send({
      message: "User with that username is already exists",
    });
  } catch (e) {
    console.log(e);
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const currentUser = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (currentUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        currentUser.rows[0].password
      );

      if (isPasswordValid) {
        const accessToken = jwt.sign(
          {
            userId: currentUser.rows[0].id,
            username,
          },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "7h" }
        );

        const refreshToken = jwt.sign(
          {
            userId: currentUser.rows[0].id,
            username,
          },
          REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        return res.send({
          message: "Login successful",
          tokens: {
            accessToken,
            refreshToken,
          },
          user: {
            id: currentUser.rows[0].id,
            username,
          },
        });
      }
      return res.send({ message: "Неверный пароль" });
    }
    return res.send({ message: "Пользователь не найден" });
  } catch (e) {
    console.log(e);
  }
});

app.put("/auth/rename", jwtAuth, async (req, res) => {
  try {
    const { newUsername } = req.body;
    await client.query(
      "UPDATE users SET username = $1 WHERE username = $2 RETURNING *",
      [newUsername, req.user.username]
    );
    return res.send({ message: "Name has been changed" });
  } catch (e) {
    console.log(e);
  }
});

app.put("/tokens/new", async (req, res) => {
  const { username } = req.body;
  const findedUser = await client.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  if (findedUser.rowCount > 0) {
    const accessToken = jwt.sign(
      {
        userId: findedUser.rows[0].id,
        username,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "7h" }
    );

    const refreshToken = jwt.sign(
      {
        userId: findedUser.rows[0].id,
        username,
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    return res.send({
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  }
  return res.send({
    message: "user with that username not founded",
  });
});

app.post("/refresh", (req, res) => {
  try {
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
    console.log(accessToken);
    res.send({
      tokens: {
        refreshToken,
        accessToken,
      },
    });
  } catch (e) {
    console.log("Ошибка верификации " + e.message);
  }
});

const connected = (ws, msg) => {
  const uniqueId = v4();
  ws.userId = uniqueId

  broadcastConnection(ws, {...msg, userID: uniqueId})
}

const broadcastConnection = (ws, msg) => {
  ws.id = msg.id;
  let online = 0;
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      online++;
    }
  });

  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      client.send(JSON.stringify({ ...msg, online, userID: client.userId }));
    }
  });
};

app.listen(PORT, () => console.log(`server has been started on PORT ${PORT}`));