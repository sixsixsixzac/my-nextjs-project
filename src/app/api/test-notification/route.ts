import { NextRequest, NextResponse } from 'next/server'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

/**
 * API route to send test notifications to the WebSocket notifications channel
 * 
 * Note: This requires a WebSocket client library. For server-side sending,
 * you may need to install 'ws' package or use Bun runtime.
 * 
 * Alternatively, use the test page which sends notifications directly from the browser.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, title, type = 'notification' } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Try to use WebSocket if available (Node.js 18+ or Bun)
    let WebSocketClient: typeof WebSocket | null = null

    // Check for global WebSocket (Node.js 18+)
    if (typeof WebSocket !== 'undefined') {
      WebSocketClient = WebSocket
    }
    // Check for Bun WebSocket
    else if (typeof Bun !== 'undefined' && (Bun as any).WebSocket) {
      WebSocketClient = (Bun as any).WebSocket
    }

    if (!WebSocketClient) {
      return NextResponse.json(
        {
          error: 'WebSocket client not available',
          details:
            'This API route requires Node.js 18+ with WebSocket support, Bun runtime, or the "ws" package.',
          suggestion:
            'Use the test page at /test-noti which sends notifications directly from the browser.',
        },
        { status: 501 }
      )
    }

    // Connect to WebSocket server as a client to send the notification
    return new Promise<NextResponse>((resolve) => {
      const ws = new WebSocketClient(WS_URL)

      const timeout = setTimeout(() => {
        ws.close()
        resolve(
          NextResponse.json(
            { error: 'Connection timeout' },
            { status: 500 }
          )
        )
      }, 5000)

      ws.onopen = () => {
        // Send notification message to the notifications channel
        const notificationMessage = {
          type: 'message',
          channel: 'notifications',
          data: {
            type: type,
            title: title || 'Test Notification',
            message: message,
            timestamp: Date.now(),
          },
        }

        ws.send(JSON.stringify(notificationMessage))

        // Close connection after sending
        setTimeout(() => {
          ws.close()
          clearTimeout(timeout)
          resolve(
            NextResponse.json({
              success: true,
              message: 'Notification sent successfully',
            })
          )
        }, 100)
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        ws.close()
        resolve(
          NextResponse.json(
            {
              error: 'Failed to connect to WebSocket server',
              details: `Make sure the WebSocket server is running on ${WS_URL}`,
            },
            { status: 500 }
          )
        )
      }
    })
  } catch (error) {
    console.error('[API] Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification', details: String(error) },
      { status: 500 }
    )
  }
}
