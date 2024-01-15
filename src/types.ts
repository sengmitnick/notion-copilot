export class ChatGPTError extends Error {
  statusCode?: number
  statusText?: string
  response?: Response
  errorText?: string
  originalError?: Error
}
