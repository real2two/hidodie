import {
  textEncoder,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePlayerJoined,
} from '@/utils';

export default (
  data: Omit<ServerWebSocketReceivePlayerJoined, 'type'>,
): ArrayBuffer => {
  // [ type, player, username ]

  const encodedMessage = textEncoder.encode(data.username);

  const buffer = new ArrayBuffer(2 + encodedMessage.byteLength);
  const view = new DataView(buffer);

  view.setUint8(0, ServerWebSocketReceiveTypes.PlayerJoined);
  view.setUint8(1, data.player);
  new Uint8Array(buffer, 2).set(encodedMessage);

  return buffer;
};
