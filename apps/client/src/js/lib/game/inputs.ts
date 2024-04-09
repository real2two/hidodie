import { ServerWebSocketTransmitTypes } from "@/utils";
import type { GameDocs, CreateRoomHandlerOptions } from "../../../types";

/**
 * Add the game inputs
 * @param docs The documents
 * @param opts The options from the `handleRoom` function
 * @returns The ability to remove the game input listeners
 */
export function addGameInputs(docs: GameDocs, opts: CreateRoomHandlerOptions) {
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  // const isTyping = () => document.activeElement === docs.sendChatInput;

  function keyDown(evt: KeyboardEvent) {
    const key = evt.key.toLowerCase();
    switch (key) {
      case "enter":
        if (document.activeElement !== docs.sendChatInput) {
          docs.sendChatInput.focus();
          docs.sendChatInput.select();
        } else {
          const message = docs.sendChatInput.value.trim();
          if (message) {
            opts.reply({
              type: ServerWebSocketTransmitTypes.SendChatMessage,
              message,
            });
          }

          docs.sendChatInput.value = "";
          docs.sendChatInput.focus();
          docs.sendChatInput.blur();
        }
        break;
    }
  }

  function keyUp(evt: KeyboardEvent) {
    // TODO: Finish key up events
    const key = evt.key.toLowerCase();
  }

  return {
    removeInputs: () => {
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("keyup", keyUp);
    },
  };
}
