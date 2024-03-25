import env from "@/env";
import express from "express";

export const app = express();

app.listen(env.AppPort);
