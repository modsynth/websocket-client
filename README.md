# WebSocket Client

[![npm version](https://badge.fury.io/js/%40modsynth%2Fwebsocket-client.svg)](https://www.npmjs.com/package/@modsynth/websocket-client)
[![npm downloads](https://img.shields.io/npm/dm/@modsynth/websocket-client.svg)](https://www.npmjs.com/package/@modsynth/websocket-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> WebSocket client with auto-reconnect and React hooks

Part of the [Modsynth](https://github.com/modsynth) ecosystem.

## Features

- WebSocket connection management
- TypeScript support
- ✨ **Auto-Reconnect**: Automatic reconnection with exponential backoff (v0.2.0)
- ✨ **React Hook**: `useWebSocket` hook for React components (v0.2.0)

## What's New in v0.2.0

- **Auto-Reconnect**: Automatic reconnection when connection is lost
- **useWebSocket Hook**: React hook for WebSocket integration

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

Current version: `v0.2.0`

## License

MIT
