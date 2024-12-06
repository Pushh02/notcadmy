import { Router } from "express";
import { AccessToken } from "livekit-server-sdk";

const router = Router();

const createToken = async () => {
    const roomName = 'quickstart-room';
    const participantName = 'quickstart-username';
  
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: participantName,
      // Token to expire after 10 minutes
      ttl: '10m',
    });
    at.addGrant({ roomJoin: true, room: roomName });
  
    return await at.toJwt();
  };
  
  router.get('/generate', async (req, res) => {
    res.send(await createToken());
  });

export { router as generateToken}