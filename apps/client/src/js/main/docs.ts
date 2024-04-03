export function getGameDocs() {
  return {
    chatMessages: document.querySelector("#chat-messages") as HTMLDivElement,
    sendChatInput: document.querySelector("#chat-input") as HTMLInputElement,
  };
}
