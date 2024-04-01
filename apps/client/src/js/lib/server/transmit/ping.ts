import {
  ServerWebSocketTransmitTypes,
  type ServerWebSocketTransmitPing,
} from "@/utils";

export default (_data: ServerWebSocketTransmitPing): ArrayBuffer => {
  // [ type ]

  return new Uint8Array([ServerWebSocketTransmitTypes.Ping]).buffer;
};
