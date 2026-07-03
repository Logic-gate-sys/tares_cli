import { useCallback, useEffect, useRef, useState } from "react";
import type { ServerMessage, ClientMessage } from '#types/messages';

export function usePlayerSocket(token: string) {
  const [events, setEvents] = useState<ServerMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 2. Append token directly to the WebSocket URL connection string
    const wsUrl = `ws://${location.hostname}:8081/ws?token=${encodeURIComponent(token)}`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (e) => {
      const event = JSON.parse(e.data) as ServerMessage;
      setEvents(event);
    };

    return () => {
      if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const send = useCallback((message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { events, connected, send };
}