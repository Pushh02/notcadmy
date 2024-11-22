import express from "express";
import "dotenv/config";
import { authRouter } from "./router/auth";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);

app.listen(`http://localhost:${process.env.PORT}`, () => {
  console.log(`connected on ${process.env.PORT}`);
});
