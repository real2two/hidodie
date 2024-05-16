import {
  textDecoder,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceiveKicked,
} from '@/utils';

export default (view: DataView): ServerWebSocketReceiveKicked => {
  // [ type, message ]

  const reason = textDecoder.decode(new Uint8Array(view.buffer, 1));

  return {
    type: ServerWebSocketReceiveTypes.Kicked,
    reason,
  };
};
