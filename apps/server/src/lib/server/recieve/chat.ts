import {
  textEncoder,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceiveSendChatMessage,
} from "@/utils";

export default (
  data: Omit<ServerWebSocketReceiveSendChatMessage, "type">,
): ArrayBuffer => {
  // [ type, player, message ]

  const encodedMessage = textEncoder.encode(data.message);

  const buffer = new ArrayBuffer(2 + encodedMessage.byteLength);
  const view = new DataView(buffer);

  view.setUint8(0, ServerWebSocketReceiveTypes.RecieveChatMessage);
  view.setUint8(1, data.player);
  new Uint8Array(buffer, 2).set(encodedMessage);

  return buffer;
};
