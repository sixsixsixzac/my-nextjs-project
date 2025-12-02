/**
 * WebSocket message types and interfaces
 */

export type WebSocketMessageType = 
  | 'ping'
  | 'pong'
  | 'message'
  | 'notification'
  | 'error'
  | 'subscribe'
  | 'unsubscribe'

export interface WebSocketMessage {
  type: WebSocketMessageType
  data?: unknown
  channel?: string
  timestamp?: number
}

export interface WebSocketConfig {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface WebSocketHookReturn {
  socket: WebSocket | null
  status: WebSocketStatus
  send: (message: WebSocketMessage) => void
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
  connect: () => void
  disconnect: () => void
  lastMessage: WebSocketMessage | null
}

