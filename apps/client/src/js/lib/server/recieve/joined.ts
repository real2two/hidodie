import {
  textDecoder,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePlayerJoined,
} from '@/utils';

export default (view: DataView): ServerWebSocketReceivePlayerJoined => {
  // [ type, player, username ]

  const player = view.getUint8(1);
  const username = textDecoder.decode(new Uint8Array(view.buffer, 2));

  return {
    type: ServerWebSocketReceiveTypes.PlayerJoined,
    player,
    username,
  };
};
