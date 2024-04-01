import {
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePing,
} from "@/utils";

export default (_data: ServerWebSocketReceivePing): ArrayBuffer => {
  // [ type ]

  return new Uint8Array([ServerWebSocketReceiveTypes.Ping]).buffer;
};
