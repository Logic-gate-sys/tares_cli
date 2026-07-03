import { useCallback, useEffect, useRef, useState } from "react";
import type{ ServerMessage, ClientMessage } from '#types/messages'


const WS_URL = `ws://${location.hostname}:8081/ws`;

export function usePlayerSocket() {
  const [events, setEvents] = useState<ServerMessage>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (e) => {
      const event = JSON.parse(e.data) as ServerMessage;
      setEvents( event);
    };
   console.log("SOCKET CONNECTED:::: ")
    return () => socket.close();
  }, []);

  const send = useCallback((message: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(message));
  }, []);

  return { events, connected, send };
}
