'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import type { WebSocketMessage } from '@/lib/websocket/types'

export default function TestWebSocketPage() {
  const { status, send, lastMessage, subscribe, unsubscribe } = useWebSocket()
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')

  useEffect(() => {
    if (lastMessage && lastMessage.type !== 'pong') {
      setMessages((prev) => [...prev, lastMessage])
    }
  }, [lastMessage])

  const handleSend = () => {
    if (inputMessage.trim()) {
      send({
        type: 'message',
        data: { text: inputMessage },
      })
      setInputMessage('')
    }
  }

  const handleSubscribe = () => {
    subscribe('notifications')
  }

  const handleUnsubscribe = () => {
    unsubscribe('notifications')
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-500'
      case 'connecting':
        return 'text-yellow-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">WebSocket Test Page</h1>
        <p className="text-gray-600">
          Test your WebSocket connection. Make sure the WebSocket server is running on port 3001.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Run: <code className="bg-gray-100 px-2 py-1 rounded">bun run ws:server</code>
        </p>
      </div>

      <div className="p-4 border rounded-lg space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">WebSocket Connection</h2>
          <span className={`text-sm ${getStatusColor()}`}>
            {status.toUpperCase()}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded"
              disabled={status !== 'connected'}
            />
            <button
              onClick={handleSend}
              disabled={status !== 'connected'}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Send
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubscribe}
              disabled={status !== 'connected'}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Subscribe to Notifications
            </button>
            <button
              onClick={handleUnsubscribe}
              disabled={status !== 'connected'}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
            >
              Unsubscribe
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Messages:</h3>
          <div className="max-h-64 overflow-y-auto border rounded p-2 space-y-1">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages yet...</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <span className="font-mono text-xs text-gray-500">
                    [{new Date(msg.timestamp || 0).toLocaleTimeString()}]
                  </span>
                  <span className="ml-2 font-semibold">{msg.type}:</span>
                  <span className="ml-2">
                    {typeof msg.data === 'object'
                      ? JSON.stringify(msg.data)
                      : String(msg.data)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
