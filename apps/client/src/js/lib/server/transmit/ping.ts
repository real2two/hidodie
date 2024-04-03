import {
  ServerWebSocketTransmitTypes,
  type ServerWebSocketTransmitPing,
} from "@/utils";

export default (
  _data: Omit<ServerWebSocketTransmitPing, "type">,
): ArrayBuffer => {
  // [ type ]

  return new Uint8Array([ServerWebSocketTransmitTypes.Ping]).buffer;
};
