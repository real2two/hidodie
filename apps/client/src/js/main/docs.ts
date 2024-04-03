export function getGameDocs() {
  return {
    chatContainer: document.querySelector("#chat_container") as HTMLDivElement,
    sendChatInput: document.querySelector("#chat_input") as HTMLInputElement,
  };
}
