import {
  textEncoder,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePlayerJoined,
} from "@/utils";

export default (
  data: Omit<ServerWebSocketReceivePlayerJoined, "type">,
): ArrayBuffer => {
  // [ type, player, hidden, username ]

  const encodedMessage = textEncoder.encode(data.username);

  const buffer = new ArrayBuffer(3 + encodedMessage.byteLength);
  const view = new DataView(buffer);

  view.setUint8(0, ServerWebSocketReceiveTypes.PlayerJoined);
  view.setUint8(1, data.player);
  view.setUint8(2, Number(data.hidden));
  new Uint8Array(buffer, 3).set(encodedMessage);

  return buffer;
};
