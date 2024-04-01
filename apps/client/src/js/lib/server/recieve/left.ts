import {
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceivePlayerLeft,
} from "@/utils";

export default (view: DataView): ServerWebSocketReceivePlayerLeft => {
  // [ type, player ]

  const player = view.getUint8(1);

  return {
    type: ServerWebSocketReceiveTypes.PlayerLeft,
    player,
  };
};
