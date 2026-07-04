export interface ImageData {
  base64: string;
  mimeType: string;
}

export interface InterpretResponse {
  analysis: string;
  reasoning?: string | null;
  conversationId?: string | null;
}
