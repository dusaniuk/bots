export interface MessageKey {
  chatId: number;
  messageId: number;
}

export interface MessageMetadata {
  topic: string;
  timestamp: number;
  messageText: string;
  messageKeys: MessageKey[];
}
