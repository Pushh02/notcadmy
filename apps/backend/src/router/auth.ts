import { Request, Response, Router } from "express";
import { db } from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { Role } from "@prisma/client";

const router = Router();

router.post("/sign-up", async (req: Request, res: Response) => {
  const { name ,email, password, cPassowrd } = req.body;

  if (password != cPassowrd) res.status(400).json({ message: "bad auth" });

  try {
    if (email && password && cPassowrd) {
      const checkExistingProfile = await db.profile.findFirst({
        where: {
          email,
        },
      });
      if (checkExistingProfile) {
        const token = jwt.sign({ profile: checkExistingProfile }, "Secretttt");
        res.status(203).send(token);
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      const profile = await db.profile.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: Role.STUDENT
        },
      });
      const token = jwt.sign({ profile: profile }, "Secretttt");
      res.send(token);
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/sign-in", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (email && password) {
      const checkExistingProfile = await db.profile.findFirst({
        where: {
          email,
        },
      });
      if (checkExistingProfile) {
        if(bcrypt.compareSync(password, checkExistingProfile.password)){
          const token = jwt.sign({ profile: checkExistingProfile }, "Secretttt");
          res.status(203).send(token);
        } else {
          res.status(403).json({message: "wrong passord"});
        }
      } else {
        res.status(404).json({ message: "profile not found" });
      }
    }
  } catch (err) {
    res.send(err);
  }
});

export { router as authRouter };
