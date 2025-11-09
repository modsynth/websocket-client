export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectDelay = 3000;

  constructor(url: string) {
    this.url = url;
  }

  connect(onMessage: (data: any) => void, onError?: (error: Event) => void): void {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => console.log('WebSocket connected');
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        onMessage(event.data);
      }
    };
    this.ws.onerror = (error) => onError?.(error);
    this.ws.onclose = () => {
      console.log('WebSocket closed, reconnecting...');
      setTimeout(() => this.connect(onMessage, onError), this.reconnectDelay);
    };
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }
}
