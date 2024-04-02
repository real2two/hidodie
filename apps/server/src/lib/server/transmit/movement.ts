import {
  getDirection,
  ServerWebSocketTransmitTypes,
  type ServerWebSocketTransmitMovement,
} from "@/utils";

export default (view: DataView): ServerWebSocketTransmitMovement => {
  // [ type, direction, posX, posY ]

  if (view.byteLength !== 10) {
    throw new Error("Provided invalid data (trasnmit/movement.ts)");
  }

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
