import {
  MovementKeyPresses,
  MovementDirectionValues,
  type MovementDirections,
} from "./game";

export function getDirectionValue(dir: MovementDirections) {
  let direction = MovementKeyPresses.NONE;
  if (dir.x === -1) direction = MovementKeyPresses.LEFT;
  if (dir.x === 1) direction = MovementKeyPresses.RIGHT;
  if (dir.y === -1) {
    switch (direction) {
      case MovementKeyPresses.NONE:
        direction = MovementKeyPresses.UP;
        break;
      case MovementKeyPresses.LEFT:
        direction = MovementKeyPresses.LEFT_UP;
        break;
      case MovementKeyPresses.RIGHT:
        direction = MovementKeyPresses.RIGHT_UP;
        break;
    }
  }
  if (dir.y === 1) {
    switch (direction) {
      case MovementKeyPresses.NONE:
        direction = MovementKeyPresses.DOWN;
        break;
      case MovementKeyPresses.LEFT:
        direction = MovementKeyPresses.LEFT_DOWN;
        break;
      case MovementKeyPresses.RIGHT:
        direction = MovementKeyPresses.RIGHT_DOWN;
        break;
    }
  }
  return direction;
}

export function getDirection(
  directionValue: MovementKeyPresses,
): MovementDirections {
  const isMovingLeft = [
    MovementKeyPresses.LEFT,
    MovementKeyPresses.LEFT_DOWN,
    MovementKeyPresses.LEFT_UP,
  ].includes(directionValue);

  const isMovingUp = [
    MovementKeyPresses.UP,
    MovementKeyPresses.LEFT_UP,
    MovementKeyPresses.RIGHT_UP,
  ].includes(directionValue);

  const isMovingDown = [
    MovementKeyPresses.DOWN,
    MovementKeyPresses.LEFT_DOWN,
    MovementKeyPresses.RIGHT_DOWN,
  ].includes(directionValue);

  const isMovingRight = [
    MovementKeyPresses.RIGHT,
    MovementKeyPresses.RIGHT_DOWN,
    MovementKeyPresses.RIGHT_UP,
  ].includes(directionValue);

  return {
    x: (isMovingLeft ? -1 : isMovingRight ? 1 : 0) as MovementDirectionValues,
    y: (isMovingUp ? -1 : isMovingDown ? 1 : 0) as MovementDirectionValues,
  };
}
