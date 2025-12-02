'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { WebSocketMessage, WebSocketConfig, WebSocketStatus, WebSocketHookReturn } from '@/lib/websocket/types'

const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000
}

/**
 * React hook for WebSocket connections
 * 
 * @example
 * ```tsx
 * const { socket, status, send, lastMessage } = useWebSocket({
 *   url: 'ws://localhost:3001',
 *   reconnectInterval: 3000
 * })
 * 
 * useEffect(() => {
 *   if (lastMessage?.type === 'notification') {
 *     console.log('Received notification:', lastMessage.data)
 *   }
 * }, [lastMessage])
 * ```
 */
export function useWebSocket(config?: WebSocketConfig): WebSocketHookReturn {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    setStatus('connecting')

    try {
      const ws = new WebSocket(finalConfig.url)
      socketRef.current = ws

      ws.onopen = () => {
        console.log('[WebSocket] Connected')
        setStatus('connected')
        setSocket(ws)
        reconnectAttemptsRef.current = 0

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'ping',
              timestamp: Date.now()
            }))
          }
        }, finalConfig.heartbeatInterval)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage
          setLastMessage(message)

          // Handle pong responses
          if (message.type === 'pong') {
            // Heartbeat successful
            return
          }

          // You can add custom message handlers here
          console.log('[WebSocket] Message received:', message)
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        setStatus('error')
      }

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected')
        setStatus('disconnected')
        setSocket(null)
        socketRef.current = null

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          heartbeatIntervalRef.current = null
        }

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < finalConfig.maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          console.log(`[WebSocket] Reconnecting... (${reconnectAttemptsRef.current}/${finalConfig.maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, finalConfig.reconnectInterval)
        } else {
          console.log('[WebSocket] Max reconnect attempts reached')
        }
      }
    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
      setStatus('error')
    }
  }, [finalConfig.url, finalConfig.reconnectInterval, finalConfig.maxReconnectAttempts, finalConfig.heartbeatInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    setSocket(null)
    setStatus('disconnected')
    reconnectAttemptsRef.current = finalConfig.maxReconnectAttempts // Prevent reconnection
  }, [finalConfig.maxReconnectAttempts])

  const send = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }))
    } else {
      console.warn('[WebSocket] Cannot send message: socket not connected')
    }
  }, [])

  const subscribe = useCallback((channel: string) => {
    send({
      type: 'subscribe',
      channel
    })
  }, [send])

  const unsubscribe = useCallback((channel: string) => {
    send({
      type: 'unsubscribe',
      channel
    })
  }, [send])

  // Auto-connect on mount
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    socket,
    status,
    send,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
    lastMessage
  }
}

