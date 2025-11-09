# WebSocket Client

> WebSocket real-time communication client

## Installation
```bash
npm install @modsynth/websocket-client
```

## Usage
```typescript
import { WebSocketClient } from '@modsynth/websocket-client';

const ws = new WebSocketClient('ws://localhost:8080');
ws.connect(
  (data) => console.log('Received:', data),
  (error) => console.error('Error:', error)
);
ws.send({ type: 'message', payload: 'Hello' });
```

## Version
v0.1.0

## License
MIT
