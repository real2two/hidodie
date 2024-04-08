import type { createRoomHandlerOptions } from "./js/lib/server/websocket";
import type { getGameDocs } from "./js/main/docs";

export type GameDocs = ReturnType<typeof getGameDocs>;
export type CreateRoomHandlerOptions = Awaited<
  ReturnType<typeof createRoomHandlerOptions>
>;
