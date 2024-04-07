import {
  textEncoder,
  type ServerWebSocketReceive,
  type ServerWebSocketReceiveTypes,
  type ServerWebSocketTransmit,
} from "@/utils";

import recieve from "./recieve";
import transmit from "./transmit";

import type { CreateRoomHandlerOptions } from "../../../types";

export async function handleRoom({
  connection,
  roomId,
  userToken,
  username,
  onOpen,
  onMessage,
  onClose,
}: {
  connection: string;
  roomId: string;
  userToken: string;
  username: string;
  onOpen: (opts: CreateRoomHandlerOptions) => unknown;
  onMessage: (
    opts: CreateRoomHandlerOptions & {
      message: ServerWebSocketReceive;
    },
  ) => unknown;
  onClose: (opts: CreateRoomHandlerOptions) => unknown;
}) {
  // Find websocket URL
  const connectionUrl = connection.startsWith("/")
    ? `${document.location.host}${connection}`
    : connection;
  const scheme =
    document.location.protocol !== "https:" ||
    connection.startsWith("localhost:") ||
    connection === "localhost"
      ? "ws"
      : "wss";
  const url = `${scheme}://${connectionUrl}/?user_token=${encodeURIComponent(userToken)}&username=${encodeURIComponent(username)}`;

  // Connect to WebSocket
  const ws = await connectToRoom(url);
  if (!ws) {
    return {
      success: false,
      reply: (_data: ServerWebSocketTransmit) => {
        throw new Error("Cannot use reply on an unsuccessful connection");
      },
    };
  }

  // Create options
  const opts = createRoomHandlerOptions(ws);

  // Join handler (sends the reply function)
  onOpen(opts);

  // Message handler
  ws.onmessage = (evt) => {
    let data: ArrayBuffer = evt.data;
    if (!(evt.data instanceof ArrayBuffer)) {
      data = textEncoder.encode(evt.data).buffer;
    }

    const view = new DataView(data);
    if (!view.byteLength) return;

    const type = view.getUint8(0) as ServerWebSocketReceiveTypes;
    const transformed = recieve[type]?.(view);

    if (!transformed) return;
    return onMessage({ message: transformed, ...opts });
  };

  // Close handler
  ws.onclose = () => onClose(opts);
  ws.onerror = (evt) => {
    console.error("WebSocket error", evt);
    ws.close();
  };

  // Returns values
  return opts;
}

export function createRoomHandlerOptions(ws: WebSocket) {
  // Create reply function
  const reply = (data: ServerWebSocketTransmit) => {
    // @ts-ignore TypeScript claims 'data' is never, but this is false.
    const transformed = transmit[data.type]?.(data);
    if (ws.readyState !== ws.OPEN) return;
    return ws.send(transformed);
  };

  // Create opts
  return {
    success: true,
    reply,
  };
}

async function connectToRoom(url: string): Promise<WebSocket | null> {
  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";

  let opened = false;
  return new Promise((resolve) => {
    ws.onopen = () => {
      return resolve(ws);
    };
    ws.onclose = () => {
      if (!opened) return resolve(null);
    };
    ws.onerror = (evt) => {
      console.error("WebSocket error", evt);
      ws.close();
    };
  });
}
