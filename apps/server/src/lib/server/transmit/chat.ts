import {
  textDecoder,
  ServerWebSocketTransmitTypes,
  type ServerWebSocketTransmitSendChatMessage,
} from '@/utils';

export default (view: DataView): ServerWebSocketTransmitSendChatMessage => {
  // [ type, message ]

  if (view.byteLength < 2) {
    throw new Error('Provided invalid data (trasnmit/chat.ts)');
  }

  const message = textDecoder.decode(new Uint8Array(view.buffer, 1));
  if (message.length > 52) {
    throw new Error('Given message was greater than 52 characters');
  }

  return {
    type: ServerWebSocketTransmitTypes.SendChatMessage,
    message,
  };
};
