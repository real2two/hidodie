import { MovementKeyPresses, type MovementDirections } from './game';

/**
 * Transform MovementDirections into a number that represents the value
 * @param dir The movement directions
 * @returns The number that represents the momement directions
 */
export function getDirectionValue(dir: MovementDirections) {
  let direction = MovementKeyPresses.NONE;

  if (dir.movingLeft) direction = MovementKeyPresses.LEFT;
  if (dir.movingRight) direction = MovementKeyPresses.RIGHT;

  if (dir.movingUp) {
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

  if (dir.movingDown) {
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

/**
 * Transform a number that represents the value into MovementDirections
 * @param value The number that represents the momement directions
 * @returns The movement directions
 */
export function getDirection(value: MovementKeyPresses): MovementDirections {
  return {
    movingLeft: [
      MovementKeyPresses.LEFT,
      MovementKeyPresses.LEFT_DOWN,
      MovementKeyPresses.LEFT_UP,
    ].includes(value),

    movingUp: [
      MovementKeyPresses.UP,
      MovementKeyPresses.LEFT_UP,
      MovementKeyPresses.RIGHT_UP,
    ].includes(value),

    movingDown: [
      MovementKeyPresses.DOWN,
      MovementKeyPresses.LEFT_DOWN,
      MovementKeyPresses.RIGHT_DOWN,
    ].includes(value),

    movingRight: [
      MovementKeyPresses.RIGHT,
      MovementKeyPresses.RIGHT_DOWN,
      MovementKeyPresses.RIGHT_UP,
    ].includes(value),
  };
}
