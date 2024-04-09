import type { Room } from "./types";

/** The map containing all rooms that's currently running on the game server */
export const rooms = new Map<string, Room>();
