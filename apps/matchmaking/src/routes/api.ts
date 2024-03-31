import HyperExpress from "hyper-express";

import { router as roomRouter } from "./api/room";
import { router as oauth2Router } from "./api/oauth2";

export const router = new HyperExpress.Router();

router.get("/", (req, res) => {
  res.json({
    hello: "world",
  });
});

router.use("/room", roomRouter);
router.use("/oauth2", oauth2Router);

router.all("/*", (req, res) => {
  res.status(404).json({
    error: "not_found",
  });
});
