import { Router } from "express";
import { db } from "../../db";
import { AccessToken, AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { randomString } from "../utils/client-utils";

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

const router = Router();

router.post("/session", async (req, res) => {
  try {
    const { title } = req.body;
    function generateRandomCode() {
      const generateSet = () => {
        return Array.from({ length: 3 }, () =>
          String.fromCharCode(Math.floor(Math.random() * 26) + 97)
        ).join("");
      };

      return `${generateSet()}-${generateSet()}-${generateSet()}`;
    }

    const live = await db.liveSeesion.create({
      data: {
        id: generateRandomCode(),
        title,
        startTime: new Date(),
        status: "INACTIVE",
      },
    });
    res.status(200).json({ sessionId: live.id });
  } catch (err) {
    console.log(err);
  }
});

router.post("/session/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const live = await db.liveSeesion.findFirst({
      where: {
        id: sessionId,
      },
    });
    if (!live) {
      res.status(404).json({ message: "Not Found (session doesn't exist)" });
    } else if (live?.status === "ACTIVE") {
      res.status(400).json({ message: "Bad Request (already started)" });
    }

    await db.liveSeesion.update({
      where: {
        id: sessionId,
      },
      data: {
        status: "ACTIVE",
        startTime: new Date(),
      },
    });
    res.status(200).json({ message: "Session started successfully" });
  } catch (err) {
    console.log(err);
  }
});

router.get("connectionDetails", async(req, res) => {
  try {
    const roomName = req.query.roomName || "";
    const participantName = req.query.participantName;

    if (roomName === "") {
      res.status(404).json({ message: 'Missing required query parameter: roomName' });
    }
    if (participantName === null) {
      res.status(404).json({ message: 'Missing required query parameter: participantName' });
    }

    const participantToken = await createParticipantToken(
      {
        identity: `${participantName}__${randomString(4)}`,
        name: participantName?.toString(),
      },
      roomName?.toString(),
    );

    const data = {
      serverUrl: LIVEKIT_URL,
      roomName: roomName,
      participantToken: participantToken,
      participantName: participantName,
    };

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
})


function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, userInfo);
  at.ttl = '5m';
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}

export { router as manageRoom };
