import {
  getDirection,
  ServerWebSocketTransmitTypes,
  type ServerWebSocketTransmitMovement,
} from "@/utils";

export default (view: DataView): ServerWebSocketTransmitMovement => {
  // [ type, direction, posX, posY ]

  const direction = getDirection(view.getUint8(1));
  const posX = view.getInt32(2);
  const posY = view.getInt32(6);

  return {
    type: ServerWebSocketTransmitTypes.Movement,
    direction,
    pos: {
      x: posX,
      y: posY,
    },
  };
};
