import env from "@/env";
import HyperExpress from "hyper-express";
import {
  ServerWebSocketTransmitTypes,
  ServerWebSocketReceiveTypes,
} from "@/utils";
import { recieve, transmit } from "../lib/server";

export const app = new HyperExpress.Server();

app.ws(
  "/",
  {
    idle_timeout: 60,
    max_payload_length: 32 * 1024,
    message_type: "ArrayBuffer",
  },
  (ws) => {
    console.log("A player has joined");

    ws.on("message", (buffer: ArrayBuffer, isBinary: boolean) => {
      if (!isBinary) return;

      const view = new DataView(buffer);
      if (!view.byteLength) return;

      const type = view.getUint8(0) as ServerWebSocketTransmitTypes;
      const transformed = transmit[type]?.(view);

      if (!transformed) return;

      // TODO: This is a WIP placeholder message
      console.log("WebSocket transformed message", transformed);
      ws.send(
        recieve[ServerWebSocketReceiveTypes.Ping]({
          type: ServerWebSocketReceiveTypes.Ping,
        }),
      );
    });

    ws.once("close", () => {
      console.log(`A player has disconnected`);
    });
  },
);

app.all("*", (req, res) => {
  res.status(404).json({
    error: "not_found",
  });
});

app.listen(env.TestingServerPort);
