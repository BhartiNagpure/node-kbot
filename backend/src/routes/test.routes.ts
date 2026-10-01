import { Router } from "express";
import { testEmbedding, testChat } from "../controllers/test.controller";

const router = Router();

router.post("/embedding", testEmbedding);
router.post("/chat", testChat);

export default router;