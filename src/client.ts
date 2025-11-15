export interface WebSocketConfig {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  protocols?: string | string[];
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (data: any) => void;
}

export enum WebSocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<Omit<WebSocketConfig, 'protocols' | 'onOpen' | 'onClose' | 'onError' | 'onMessage'>> & Pick<WebSocketConfig, 'protocols' | 'onOpen' | 'onClose' | 'onError' | 'onMessage'>;
  private reconnectAttempts = 0;
  private shouldReconnect = true;
  private messageQueue: any[] = [];
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      reconnectDelay: config.reconnectDelay ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      protocols: config.protocols,
      onOpen: config.onOpen,
      onClose: config.onClose,
      onError: config.onError,
      onMessage: config.onMessage,
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.status = WebSocketStatus.CONNECTING;
      this.ws = new WebSocket(this.config.url, this.config.protocols);

      this.ws.onopen = () => {
        this.status = WebSocketStatus.CONNECTED;
        this.reconnectAttempts = 0;
        this.config.onOpen?.();
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.config.onMessage?.(data);
        } catch {
          this.config.onMessage?.(event.data);
        }
      };

      this.ws.onerror = (error) => {
        this.status = WebSocketStatus.ERROR;
        this.config.onError?.(error);
      };

      this.ws.onclose = (event) => {
        this.status = WebSocketStatus.DISCONNECTED;
        this.config.onClose?.(event);

        if (this.shouldReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.config.reconnectDelay);
        }
      };
    } catch (error) {
      this.status = WebSocketStatus.ERROR;
      console.error('WebSocket connection error:', error);
    }
  }

  send(data: any): void {
    const message = typeof data === 'string' ? data : JSON.stringify(data);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message);
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      this.ws.send(message);
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.ws?.close();
    this.ws = null;
    this.status = WebSocketStatus.DISCONNECTED;
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === WebSocketStatus.CONNECTED;
  }
}
