import { sanitizeHtml } from "@/utils";

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

/**
 * Clear chat
 * @param doc The <div> element
 */
export function clearChat(doc: HTMLDivElement) {
  // Clear chat
  messages.splice(messages.length);
  // Update chat messages
  updateChatMessage(doc);
}

/**
 * Add a chat message
 * @param doc The <div> element
 * @param color The color
 * @param message The message
 */
export function addChatMessage(
  doc: HTMLDivElement,
  color: ChatColors,
  message: string,
) {
  // Add message
  messages.push(
    `<span class="chat-${CHAT_COLOR_VALUES[color]}">${sanitizeHtml(
      message,
    )}<br></span>`,
  );
  // Update chat messages
  updateChatMessage(doc);
}

/**
 * Updates the displayed chat messages
 * @param doc The <div> element
 */
export function updateChatMessage(doc: HTMLDivElement) {
  // Only keep top 9 message
  messages.splice(0, messages.length - 9);
  // Update chat messages
  doc.innerHTML = messages.join("");
  // Scroll down
  doc.scrollTop = doc.scrollHeight;
}
