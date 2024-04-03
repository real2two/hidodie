const messages: string[] = [];

export enum ChatColors {
  Default = 0,
  Success = 2,
  Error = 1,
  Secondary = 3,
}

const CHAT_COLOR_VALUES = {
  [ChatColors.Default]: "FFFFFF",
  [ChatColors.Success]: "00461D",
  [ChatColors.Error]: "720000",
  [ChatColors.Secondary]: "505050",
};

export function addChatMessage(
  doc: HTMLDivElement,
  color: ChatColors,
  message: string,
) {
  // Add message
  messages.push(
    `<span style="color:#${CHAT_COLOR_VALUES[color]}">${message}</span>`,
  );
  // Only keep top 9 message
  messages.splice(0, messages.length - 9);
  // Update chat messages
  doc.innerHTML = messages.map((m) => `${m}<br>`).join("");
}
