import {
  textDecoder,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceiveSendChatMessage,
} from "@/utils";

export default (view: DataView): ServerWebSocketReceiveSendChatMessage => {
  // [ type, player, message ]

  const player = view.getUint8(1);
  const message = textDecoder.decode(new Uint8Array(view.buffer, 2));

  return {
    type: ServerWebSocketReceiveTypes.RecieveChatMessage,
    player,
    message,
  };
};
