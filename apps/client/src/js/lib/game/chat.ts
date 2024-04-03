const messages: string[] = [];

export enum ChatColors {
  Default = 0,
  Success = 2,
  Error = 1,
  Secondary = 3,
}

const CHAT_COLOR_VALUES = {
  [ChatColors.Default]: "default",
  [ChatColors.Success]: "success",
  [ChatColors.Error]: "error",
  [ChatColors.Secondary]: "secondary",
};

export function clearChat(doc: HTMLDivElement) {
  // Clear chat
  messages.splice(messages.length);
  // Update chat messages
  updateChatMessage(doc);
}

export function addChatMessage(
  doc: HTMLDivElement,
  color: ChatColors,
  message: string,
) {
  // Add message
  messages.push(
    `<span class="chat-${CHAT_COLOR_VALUES[color]}">${message}<br></span>`,
  );
  // Update chat messages
  updateChatMessage(doc);
}

export function updateChatMessage(doc: HTMLDivElement) {
  // Only keep top 9 message
  messages.splice(0, messages.length - 9);
  // Update chat messages
  doc.innerHTML = messages.join("");
  // Scroll down
  doc.scrollTop = doc.scrollHeight;
}
