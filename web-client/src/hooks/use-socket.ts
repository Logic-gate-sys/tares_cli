import { useCallback, useEffect, useRef, useState } from "react";
import type { ServerMessage, ClientMessage } from '#types/messages';



export function usePlayerSocket(onMessage: (msg: ServerMessage) => void, token?: string) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    if (!token) return; 
    onMessageRef.current = onMessage;
    console.log("TOKEN FROM USE_SOCKET: ", token)
    const wsUrl = `ws://${location.hostname}:8081/ws?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    // open & close
    socket.addEventListener("open", () => setConnected(true));
    socket.addEventListener("close", () => setConnected(false));

    // message
    socket.addEventListener("message", (e) => {
      try {
        const message = JSON.parse(e.data) as ServerMessage;
        onMessageRef.current(message);

      } catch (err: unknown) {
        console.error("Failed to transcribed message: ", (err as Error).message)
      }
    });

    // clean up
    return () => {
      if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [onMessage, token]);

  // a helper to send client messages to socket server
  const send = useCallback((message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { connected, send };
}
