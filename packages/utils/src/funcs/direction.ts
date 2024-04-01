import {
  GamePlayerKeyPresses,
  GamePlayerDirectionValues,
  type GamePlayerDirections,
} from "./game";

export function getDirectionValue(dir: GamePlayerDirections) {
  let direction = GamePlayerKeyPresses.NONE;
  if (dir.x === -1) direction = GamePlayerKeyPresses.LEFT;
  if (dir.x === 1) direction = GamePlayerKeyPresses.RIGHT;
  if (dir.y === -1) {
    switch (direction) {
      case GamePlayerKeyPresses.NONE:
        direction = GamePlayerKeyPresses.UP;
        break;
      case GamePlayerKeyPresses.LEFT:
        direction = GamePlayerKeyPresses.LEFT_UP;
        break;
      case GamePlayerKeyPresses.RIGHT:
        direction = GamePlayerKeyPresses.RIGHT_UP;
        break;
    }
  }
  if (dir.y === 1) {
    switch (direction) {
      case GamePlayerKeyPresses.NONE:
        direction = GamePlayerKeyPresses.DOWN;
        break;
      case GamePlayerKeyPresses.LEFT:
        direction = GamePlayerKeyPresses.LEFT_DOWN;
        break;
      case GamePlayerKeyPresses.RIGHT:
        direction = GamePlayerKeyPresses.RIGHT_DOWN;
        break;
    }
  }
  return direction;
}

export function getDirection(
  directionValue: GamePlayerKeyPresses,
): GamePlayerDirections {
  const isMovingLeft = [
    GamePlayerKeyPresses.LEFT,
    GamePlayerKeyPresses.LEFT_DOWN,
    GamePlayerKeyPresses.LEFT_UP,
  ].includes(directionValue);

  const isMovingUp = [
    GamePlayerKeyPresses.UP,
    GamePlayerKeyPresses.LEFT_UP,
    GamePlayerKeyPresses.RIGHT_UP,
  ].includes(directionValue);

  const isMovingDown = [
    GamePlayerKeyPresses.DOWN,
    GamePlayerKeyPresses.LEFT_DOWN,
    GamePlayerKeyPresses.RIGHT_DOWN,
  ].includes(directionValue);

  const isMovingRight = [
    GamePlayerKeyPresses.RIGHT,
    GamePlayerKeyPresses.RIGHT_DOWN,
    GamePlayerKeyPresses.RIGHT_UP,
  ].includes(directionValue);

  return {
    x: (isMovingLeft ? -1 : isMovingRight ? 1 : 0) as GamePlayerDirectionValues,
    y: (isMovingUp ? -1 : isMovingDown ? 1 : 0) as GamePlayerDirectionValues,
  };
}
