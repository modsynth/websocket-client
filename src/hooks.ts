import { useEffect, useState, useRef, useCallback } from 'react';
import { WebSocketClient, WebSocketStatus, WebSocketConfig } from './client';

export interface UseWebSocketOptions {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  protocols?: string | string[];
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  autoConnect?: boolean;
}

export interface UseWebSocketReturn {
  send: (data: any) => void;
  connect: () => void;
  disconnect: () => void;
  status: WebSocketStatus;
  isConnected: boolean;
  lastMessage: any;
}

/**
 * React hook for WebSocket connection
 *
 * @example
 * ```tsx
 * const { send, status, lastMessage } = useWebSocket({
 *   url: 'wss://api.example.com/ws',
 *   onOpen: () => console.log('Connected'),
 *   autoConnect: true,
 * });
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.DISCONNECTED);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const clientRef = useRef<WebSocketClient | null>(null);
  const { autoConnect = true, ...config } = options;

  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      setStatus(WebSocketStatus.DISCONNECTED);
    }
  }, []);

  const send = useCallback((data: any) => {
    if (clientRef.current) {
      clientRef.current.send(data);
    }
  }, []);

  useEffect(() => {
    const wsConfig: WebSocketConfig = {
      ...config,
      onOpen: () => {
        setStatus(WebSocketStatus.CONNECTED);
        config.onOpen?.();
      },
      onClose: (event) => {
        setStatus(WebSocketStatus.DISCONNECTED);
        config.onClose?.(event);
      },
      onError: (event) => {
        setStatus(WebSocketStatus.ERROR);
        config.onError?.(event);
      },
      onMessage: (data) => {
        setLastMessage(data);
      },
    };

    clientRef.current = new WebSocketClient(wsConfig);

    if (autoConnect) {
      clientRef.current.connect();
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [config.url]); // Only recreate on URL change

  return {
    send,
    connect,
    disconnect,
    status,
    isConnected: status === WebSocketStatus.CONNECTED,
    lastMessage,
  };
}
