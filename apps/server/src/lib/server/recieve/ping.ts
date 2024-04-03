import {
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePing,
} from "@/utils";

export default (
  _data: Omit<ServerWebSocketReceivePing, "type">,
): ArrayBuffer => {
  // [ type ]

  return new Uint8Array([ServerWebSocketReceiveTypes.Ping]).buffer;
};
