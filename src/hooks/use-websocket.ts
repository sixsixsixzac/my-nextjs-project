'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { 
  Subject, 
  BehaviorSubject, 
  Observable, 
  Subscription,
  interval, 
  timer, 
  EMPTY,
  throwError
} from 'rxjs'
import { 
  filter, 
  catchError, 
  retryWhen, 
  tap, 
  switchMap,
  share,
  takeWhile,
  scan
} from 'rxjs/operators'
import type { WebSocketMessage, WebSocketConfig, WebSocketStatus, WebSocketHookReturn } from '@/lib/websocket/types'

const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  autoConnect: true,
}

/**
 * React hook for WebSocket connections using RxJS
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

  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  // RxJS subjects and observables
  const messageSubjectRef = useRef<Subject<WebSocketMessage>>(new Subject())
  const statusSubjectRef = useRef<BehaviorSubject<WebSocketStatus>>(new BehaviorSubject<WebSocketStatus>('disconnected'))
  const socketSubjectRef = useRef<BehaviorSubject<WebSocket | null>>(new BehaviorSubject<WebSocket | null>(null))
  const connectSubjectRef = useRef<Subject<void>>(new Subject())
  const disconnectSubjectRef = useRef<Subject<void>>(new Subject())
  const sendSubjectRef = useRef<Subject<WebSocketMessage>>(new Subject())
  
  const connectionSubscriptionRef = useRef<Subscription | null>(null)
  const heartbeatSubscriptionRef = useRef<Subscription | null>(null)

  // Create WebSocket connection observable
  const createWebSocketConnection = useCallback((): Observable<WebSocket> => {
    return new Observable<WebSocket>((subscriber) => {
      try {
        const ws = new WebSocket(finalConfig.url)
        
        ws.onopen = () => {
          console.log('[WebSocket] Connected')
          statusSubjectRef.current.next('connected')
          socketSubjectRef.current.next(ws)
          setStatus('connected')
          setSocket(ws)
          subscriber.next(ws)
        }

        ws.onerror = (error) => {
          console.error(`[WebSocket] Connection error to ${finalConfig.url}:`, error)
          statusSubjectRef.current.next('error')
          setStatus('error')
          subscriber.error(error)
        }

        ws.onclose = (event) => {
          const wasClean = event.wasClean
          const code = event.code
          const reason = event.reason
          
          console.log(`[WebSocket] Disconnected (code: ${code}, clean: ${wasClean}${reason ? `, reason: ${reason}` : ''})`)
          statusSubjectRef.current.next('disconnected')
          socketSubjectRef.current.next(null)
          setStatus('disconnected')
          setSocket(null)
          
          if (!subscriber.closed) {
            subscriber.complete()
          }
        }

        // Handle incoming messages
        const messageHandler = (event: MessageEvent) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage
            messageSubjectRef.current.next(message)
            setLastMessage(message)

            // Handle pong responses
            if (message.type === 'pong') {
              // Heartbeat successful
              return
            }

            console.log('[WebSocket] Message received:', message)
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error)
          }
        }

        ws.addEventListener('message', messageHandler)

        // Cleanup function
        return () => {
          ws.removeEventListener('message', messageHandler)
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close()
          }
        }
      } catch (error) {
        console.error('[WebSocket] Connection error:', error)
        statusSubjectRef.current.next('error')
        setStatus('error')
        subscriber.error(error)
      }
    })
  }, [finalConfig.url])

  // Connection management observable
  useEffect(() => {
    let reconnectAttempts = 0

    const connection$ = connectSubjectRef.current.pipe(
      switchMap(() => {
        // Check if already connected
        const currentSocket = socketSubjectRef.current.value
        if (currentSocket?.readyState === WebSocket.OPEN) {
          return EMPTY
        }

        statusSubjectRef.current.next('connecting')
        setStatus('connecting')
        reconnectAttempts = 0

        return createWebSocketConnection().pipe(
          retryWhen((errors) => {
            return errors.pipe(
              scan((attemptCount) => {
                reconnectAttempts = attemptCount + 1
                return reconnectAttempts
              }, 0),
              switchMap((attemptCount) => {
                if (
                  finalConfig.autoConnect &&
                  attemptCount <= finalConfig.maxReconnectAttempts
                ) {
                  console.log(`[WebSocket] Reconnecting... (${attemptCount}/${finalConfig.maxReconnectAttempts})`)
                  return timer(finalConfig.reconnectInterval)
                } else {
                  if (finalConfig.autoConnect) {
                    console.log('[WebSocket] Max reconnect attempts reached')
                  }
                  reconnectAttempts = 0
                  return throwError(() => new Error('Max reconnect attempts reached'))
                }
              })
            )
          }),
          catchError((error) => {
            console.error('[WebSocket] Connection failed:', error)
            return EMPTY
          })
        )
      }),
      share()
    )

    // Subscribe to connection
    connectionSubscriptionRef.current = connection$.subscribe()

    // Handle disconnect
    const disconnect$ = disconnectSubjectRef.current.pipe(
      tap(() => {
        const currentSocket = socketSubjectRef.current.value
        if (currentSocket) {
          currentSocket.close()
        }
        reconnectAttempts = finalConfig.maxReconnectAttempts // Prevent reconnection
        statusSubjectRef.current.next('disconnected')
        setStatus('disconnected')
        setSocket(null)
      })
    )

    const disconnectSubscription = disconnect$.subscribe()

    // Handle send messages
    const send$ = sendSubjectRef.current.pipe(
      switchMap((message) => {
        const currentSocket = socketSubjectRef.current.value
        if (currentSocket?.readyState === WebSocket.OPEN) {
          try {
            currentSocket.send(JSON.stringify({
              ...message,
              timestamp: Date.now()
            }))
          } catch (error) {
            console.error('[WebSocket] Error sending message:', error)
          }
        } else {
          console.warn('[WebSocket] Cannot send message: socket not connected')
        }
        return EMPTY
      })
    )

    const sendSubscription = send$.subscribe()

    // Heartbeat observable
    const heartbeat$ = socketSubjectRef.current.pipe(
      filter((ws): ws is WebSocket => ws !== null),
      switchMap((ws) => {
        return interval(finalConfig.heartbeatInterval).pipe(
          takeWhile(() => ws.readyState === WebSocket.OPEN),
          tap(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'ping',
                timestamp: Date.now()
              }))
            }
          })
        )
      })
    )

    heartbeatSubscriptionRef.current = heartbeat$.subscribe()

    // Auto-connect if enabled
    if (finalConfig.autoConnect) {
      connectSubjectRef.current.next()
    }

    // Cleanup
    return () => {
      connectionSubscriptionRef.current?.unsubscribe()
      disconnectSubscription.unsubscribe()
      sendSubscription.unsubscribe()
      heartbeatSubscriptionRef.current?.unsubscribe()
      
      const currentSocket = socketSubjectRef.current.value
      if (currentSocket) {
        currentSocket.close()
      }
    }
  }, [createWebSocketConnection, finalConfig.autoConnect, finalConfig.reconnectInterval, finalConfig.maxReconnectAttempts, finalConfig.heartbeatInterval])

  // Subscribe to status changes
  useEffect(() => {
    const statusSubscription = statusSubjectRef.current.subscribe((newStatus) => {
      setStatus(newStatus)
    })

    return () => {
      statusSubscription.unsubscribe()
    }
  }, [])

  const connect = useCallback(() => {
    connectSubjectRef.current.next()
  }, [])

  const disconnect = useCallback(() => {
    disconnectSubjectRef.current.next()
  }, [])

  const send = useCallback((message: WebSocketMessage) => {
    sendSubjectRef.current.next(message)
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

  return {
    socket,
    status,
    send,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
    lastMessage,
    messages$: messageSubjectRef.current.asObservable()
  }
}

