import {
  getDirection,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceiveMovement,
} from "@/utils";

export default (view: DataView): ServerWebSocketReceiveMovement => {
  // [ type, player, direction, posX, posY ]

  const player = view.getUint8(1);
  const direction = getDirection(view.getUint8(2));
  const posX = view.getInt32(3);
  const posY = view.getInt32(7);

  return {
    type: ServerWebSocketReceiveTypes.Movement,
    player,
    direction,
    pos: {
      x: posX,
      y: posY,
    },
  };
};
