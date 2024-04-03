import type { createRoomHandlerOptions } from "./js/lib/server/websocket";
import type { getGameDocs } from "./js/main/docs";

export interface MatchMakingRoom {
  room: {
    id: string;
    connection: string;
  };
}

export interface MatchMakingError {
  error: string;
  error_description?: string;
}

export type GameDocs = ReturnType<typeof getGameDocs>;
export type CreateRoomHandlerOptions = Awaited<
  ReturnType<typeof createRoomHandlerOptions>
>;
