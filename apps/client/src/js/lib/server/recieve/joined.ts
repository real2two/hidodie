import {
  textDecoder,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePlayerJoined,
} from "@/utils";

export default (view: DataView): ServerWebSocketReceivePlayerJoined => {
  // [ type, player, hidden, username ]

  const player = view.getUint8(1);
  const hidden = !!view.getUint8(2);
  const username = textDecoder.decode(new Uint8Array(view.buffer, 3));

  return {
    type: ServerWebSocketReceiveTypes.PlayerJoined,
    hidden,
    player,
    username,
  };
};
