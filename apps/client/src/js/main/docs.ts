export function getGameDocs() {
  return {
    chatMessages: document.querySelector("#chat-container") as HTMLDivElement,
    sendChatInput: document.querySelector("#chat-input") as HTMLInputElement,
  };
}
