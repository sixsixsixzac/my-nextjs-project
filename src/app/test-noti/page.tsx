'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/use-websocket'
import type { WebSocketMessage } from '@/lib/websocket/types'

export default function TestNotificationPage() {
  const { status: wsStatus, send, lastMessage, subscribe } = useWebSocket()
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([])
  const [formData, setFormData] = useState({
    title: 'Test Notification',
    message: 'This is a test notification message',
    type: 'notification',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  // Subscribe to notifications channel when connected
  useEffect(() => {
    if (wsStatus === 'connected') {
      subscribe('notifications')
    }
  }, [wsStatus, subscribe])

  // Listen for notifications
  useEffect(() => {
    if (
      lastMessage &&
      lastMessage.type === 'message' &&
      lastMessage.channel === 'notifications'
    ) {
      const exists = notifications.some(
        (n) => n.timestamp === lastMessage.timestamp
      )
      if (!exists) {
        setNotifications((prev) => [...prev, lastMessage])
      }
    }
  }, [lastMessage, notifications])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (wsStatus !== 'connected') {
      setResult({
        error: 'WebSocket not connected. Please wait for connection.',
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Send notification message to the notifications channel
      send({
        type: 'message',
        channel: 'notifications',
        data: {
          type: formData.type,
          title: formData.title,
          message: formData.message,
          timestamp: Date.now(),
        },
      })

      setResult({ success: true })
      setFormData((prev) => ({ ...prev, message: '' }))
    } catch (error) {
      setResult({ error: 'Failed to send notification: ' + String(error) })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (wsStatus) {
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
        <h1 className="text-3xl font-bold mb-2">Test Notification Page</h1>
        <p className="text-gray-600">
          Send test notifications to users subscribed to the notifications channel.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Make sure the WebSocket server is running and users are logged in to receive notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold mb-4">Send Test Notification</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded"
                rows={4}
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="notification">Notification</option>
                <option value="alert">Alert</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </form>

          {result && (
            <div
              className={`mt-4 p-3 rounded ${
                result.success
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {result.success ? (
                <p>✓ Notification sent successfully!</p>
              ) : (
                <p>✗ {result.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Received Notifications */}
        <div className="p-6 border rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Received Notifications</h2>
            <span className={`text-sm ${getStatusColor()}`}>
              {wsStatus.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No notifications received yet. Make sure you're logged in and
                subscribed to the notifications channel.
              </p>
            ) : (
              notifications
                .slice()
                .reverse()
                .map((notification, index) => {
                  const data = notification.data as {
                    title?: string
                    message?: string
                    type?: string
                  }
                  return (
                    <div
                      key={index}
                      className="p-3 border rounded bg-gray-50 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">
                          {data.title || 'Notification'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {notification.timestamp
                            ? new Date(
                                notification.timestamp
                              ).toLocaleTimeString()
                            : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{data.message}</p>
                      {data.type && (
                        <span className="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {data.type}
                        </span>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
