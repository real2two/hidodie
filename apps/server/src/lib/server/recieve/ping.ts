import {
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePing,
} from "@/utils";

export default (): ArrayBuffer => {
  // [ type ]

  return new Uint8Array([ServerWebSocketReceiveTypes.Ping]).buffer;
};
