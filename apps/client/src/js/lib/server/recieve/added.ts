import {
  textDecoder,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePlayerAdded,
} from "@/utils";

export default (view: DataView): ServerWebSocketReceivePlayerAdded => {
  // [ type, player, username ]

  const player = view.getUint8(1);
  const username = textDecoder.decode(new Uint8Array(view.buffer, 2));

  return {
    type: ServerWebSocketReceiveTypes.PlayerAdded,
    player,
    username,
  };
};
