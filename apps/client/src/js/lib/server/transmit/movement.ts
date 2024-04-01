import {
  getDirectionValue,
  ServerWebSocketTransmitTypes,
  type ServerWebSocketTransmitMovement,
} from "@/utils";

export default (data: ServerWebSocketTransmitMovement): ArrayBuffer => {
  // [ type, direction, posX, posY ]

  const buffer = new ArrayBuffer(10);
  const view = new DataView(buffer);

  view.setUint8(0, ServerWebSocketTransmitTypes.Movement);
  view.setUint8(1, getDirectionValue(data.direction));
  view.setInt32(2, data.pos.x);
  view.setInt32(6, data.pos.y);

  return buffer;
};
