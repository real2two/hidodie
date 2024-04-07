import { ServerWebSocketTransmitTypes } from "@/utils";
import type { GameDocs, CreateRoomHandlerOptions } from "../../../types";

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

  // TODO: Finish key up events
  function keyUp(_evt: KeyboardEvent) {
    // const key = evt.key.toLowerCase();
  }

  return {
    removeInputs: () => {
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("keyup", keyUp);
    },
  };
}
