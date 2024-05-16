import {
  textEncoder,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceiveKicked,
} from '@/utils';

export default (
  data: Omit<ServerWebSocketReceiveKicked, 'type'>,
): ArrayBuffer => {
  // [ type, reason ]

  const encodedReason = textEncoder.encode(data.reason);

  const buffer = new ArrayBuffer(1 + encodedReason.byteLength);
  const view = new DataView(buffer);

  view.setUint8(0, ServerWebSocketReceiveTypes.Kicked);
  new Uint8Array(buffer, 1).set(encodedReason);

  return buffer;
};
