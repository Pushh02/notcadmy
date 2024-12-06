import express from "express";
import "dotenv/config";
import { authRouter } from "./router/auth";
import cors from "cors"
import cookieParser from "cookie-parser";
import { manageRoom } from "./router/webRTC/manageSession";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/session", manageRoom)

app.listen(process.env.PORT, () => {
  console.log(`connected on http://localhost:${process.env.PORT}`);
});
