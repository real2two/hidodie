import {
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePlayerLeft,
} from "@/utils";

export default (
  data: Omit<ServerWebSocketReceivePlayerLeft, "type">,
): ArrayBuffer => {
  // [ type, player ]

  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);

  view.setUint8(0, ServerWebSocketReceiveTypes.PlayerLeft);
  view.setUint8(1, data.player);

  return buffer;
};
