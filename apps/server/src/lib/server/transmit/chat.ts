import {
  textDecoder,
  ServerWebSocketTransmitTypes,
  type ServerWebSocketTransmitSendChatMessage,
} from "@/utils";

export default (view: DataView): ServerWebSocketTransmitSendChatMessage => {
  // [ type, message ]

  const message = textDecoder.decode(new Uint8Array(view.buffer, 1));

  return {
    type: ServerWebSocketTransmitTypes.SendChatMessage,
    message,
  };
};
