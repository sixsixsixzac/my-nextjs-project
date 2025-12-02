/**
 * WebSocket Server using Bun's native WebSocket API
 * 
 * This server handles WebSocket connections and can be run alongside Next.js
 * Run with: bun run src/lib/websocket/server.ts
 */

// Connection data type
interface ConnectionData {
  createdAt: number
  connectionId: string
}

// Store active connections - using Bun's ServerWebSocket type
const connections = new Map<string, { send: (data: string) => void; readyState: number }>()

// Channel subscriptions: channel -> Set of connection IDs
const channelSubscriptions = new Map<string, Set<string>>()

// Message types
type MessageType = 
  | 'ping'
  | 'pong'
  | 'message'
  | 'notification'
  | 'error'
  | 'subscribe'
  | 'unsubscribe'

interface WebSocketMessage {
  type: MessageType
  data?: unknown
  channel?: string
  timestamp?: number
}

/**
 * Broadcast message to all connected clients
 */
function broadcastMessage(message: WebSocketMessage, excludeConnectionId?: string) {
  const broadcastData = JSON.stringify({
    ...message,
    timestamp: Date.now()
  })

  connections.forEach((ws, connectionId) => {
    if (connectionId !== excludeConnectionId && ws.readyState === 1) { // WebSocket.OPEN = 1
      ws.send(broadcastData)
    }
  })
}

/**
 * Broadcast message to a specific channel
 */
function broadcastToChannel(channel: string, message: WebSocketMessage) {
  const subscribers = channelSubscriptions.get(channel)
  if (!subscribers || subscribers.size === 0) {
    return
  }

  const broadcastData = JSON.stringify({
    ...message,
    timestamp: Date.now()
  })

  subscribers.forEach((connectionId) => {
    const ws = connections.get(connectionId)
    if (ws && ws.readyState === 1) { // WebSocket.OPEN = 1
      ws.send(broadcastData)
    }
  })
}

/**
 * Send message to specific connection
 */
export function sendToConnection(connectionId: string, message: WebSocketMessage): boolean {
  const ws = connections.get(connectionId)
  if (ws && ws.readyState === 1) { // WebSocket.OPEN = 1
    ws.send(JSON.stringify({
      ...message,
      timestamp: Date.now()
    }))
    return true
  }
  return false
}

/**
 * Send message to a specific channel
 */
export function sendToChannel(channel: string, message: WebSocketMessage): void {
  broadcastToChannel(channel, message)
}

/**
 * Broadcast to all connections
 */
export function broadcast(data: unknown, type: MessageType = 'message') {
  broadcastMessage({ type, data })
}

/**
 * Get connection count
 */
export function getConnectionCount(): number {
  return connections.size
}

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001
const HOST = process.env.WS_HOST || 'localhost'

/**
 * Start WebSocket server
 */
export async function startWebSocketServer() {
  const server = Bun.serve<ConnectionData>({
    port: PORT,
    hostname: HOST,
    fetch(req, server) {
      // Check if this is a WebSocket upgrade request
      const upgrade = server.upgrade(req, {
        data: {
          createdAt: Date.now(),
          connectionId: crypto.randomUUID()
        }
      })

      if (upgrade) {
        return // WebSocket upgrade successful
      }

      // Handle HTTP requests (health check, etc.)
      return new Response(JSON.stringify({
        status: 'ok',
        connections: connections.size,
        message: 'WebSocket server is running'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    },
    websocket: {
      message: (ws, message) => {
        const connectionId = ws.data.connectionId
        
        try {
          const data = JSON.parse(message as string) as WebSocketMessage

          switch (data.type) {
            case 'ping':
              // Respond to ping with pong
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: Date.now()
              } as WebSocketMessage))
              break

            case 'subscribe':
              // Subscribe to a channel
              if (data.channel) {
                if (!channelSubscriptions.has(data.channel)) {
                  channelSubscriptions.set(data.channel, new Set())
                }
                channelSubscriptions.get(data.channel)!.add(connectionId)
                console.log(`[WebSocket] ${connectionId} subscribed to channel: ${data.channel}`)
              }
              break

            case 'unsubscribe':
              // Unsubscribe from a channel
              if (data.channel) {
                const subscribers = channelSubscriptions.get(data.channel)
                if (subscribers) {
                  subscribers.delete(connectionId)
                  if (subscribers.size === 0) {
                    channelSubscriptions.delete(data.channel)
                  }
                }
                console.log(`[WebSocket] ${connectionId} unsubscribed from channel: ${data.channel}`)
              }
              break

            case 'message':
              // Broadcast message to all connections or specific channel
              if (data.channel) {
                broadcastToChannel(data.channel, data)
              } else {
                broadcastMessage(data, connectionId)
              }
              break

            default:
              console.warn(`[WebSocket] Unknown message type: ${data.type}`)
          }
        } catch (error) {
          console.error('[WebSocket] Error handling message:', error)
          ws.send(JSON.stringify({
            type: 'error',
            data: { message: 'Invalid message format' },
            timestamp: Date.now()
          } as WebSocketMessage))
        }
      },
      open: (ws) => {
        const connectionId = ws.data.connectionId
        connections.set(connectionId, {
          send: (data: string) => ws.send(data),
          readyState: ws.readyState
        })

        console.log(`[WebSocket] Connection opened: ${connectionId}`)
        console.log(`[WebSocket] Total connections: ${connections.size}`)

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'message',
          data: { message: 'Connected to WebSocket server', connectionId },
          timestamp: Date.now()
        } as WebSocketMessage))
      },
      close: (ws) => {
        const connectionId = ws.data.connectionId
        
        // Remove from all channel subscriptions
        channelSubscriptions.forEach((subscribers, channel) => {
          subscribers.delete(connectionId)
          if (subscribers.size === 0) {
            channelSubscriptions.delete(channel)
          }
        })

        connections.delete(connectionId)
        console.log(`[WebSocket] Connection closed: ${connectionId}`)
        console.log(`[WebSocket] Total connections: ${connections.size}`)
      }
    }
  })

  console.log(`[WebSocket] Server started on ws://${HOST}:${PORT}`)
  return server
}

// Start server if this file is run directly
if (import.meta.main) {
  startWebSocketServer().catch(console.error)
}

