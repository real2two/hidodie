import {
  textEncoder,
  ServerWebSocketTransmitTypes,
  type ServerWebSocketTransmitSendChatMessage,
} from "@/utils";

export default (
  data: Omit<ServerWebSocketTransmitSendChatMessage, "type">,
): ArrayBuffer => {
  // [ type, message ]

  const encodedMessage = textEncoder.encode(data.message);

  const buffer = new ArrayBuffer(1 + encodedMessage.byteLength);
  const view = new DataView(buffer);

  view.setUint8(0, ServerWebSocketTransmitTypes.SendChatMessage);
  new Uint8Array(buffer, 1).set(encodedMessage);

  return buffer;
};
