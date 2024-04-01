import {
  getDirectionValue,
  ServerWebSocketReceiveTypes,
  type ServerWebSocketReceiveMovement,
} from "@/utils";

export default (data: ServerWebSocketReceiveMovement): ArrayBuffer => {
  // [ type, player, direction, posX, posY ]

  const buffer = new ArrayBuffer(11);
  const view = new DataView(buffer);

  view.setUint8(0, ServerWebSocketReceiveTypes.Movement);
  view.setUint8(1, data.player);
  view.setUint8(2, getDirectionValue(data.direction));
  view.setInt32(3, data.pos.x);
  view.setInt32(7, data.pos.y);

  return buffer;
};
