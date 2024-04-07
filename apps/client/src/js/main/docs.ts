export function getGameDocs() {
  return {
    canvas: document.querySelector("#canvas") as HTMLCanvasElement,
    chatMessages: document.querySelector("#chat-container") as HTMLDivElement,
    sendChatInput: document.querySelector("#chat-input") as HTMLInputElement,
  };
}
