export interface MessageKey {
  chatId: number;
  messageId: number;
}

export interface MessageMetadata {
  id?: string;
  topic: string;
  timestamp: number;
  messageText: string;
  messageKeys: MessageKey[];
}
