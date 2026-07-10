import { useCallback, useEffect, useRef, useState } from "react";
import type { ServerMessage, ClientMessage } from '#types/messages';

export function usePlayerSocket(token: string) {
  const [events, setEvents] = useState<ServerMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `ws://${location.hostname}:8081/ws?token=${encodeURIComponent(token)}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    // open
    socket.addEventListener("open", () => {
      console.log("Socket opened <--")
      setConnected(true);
    })
    // message arrives
    socket.addEventListener("message", (e) => {
      const event = JSON.parse(e.data) as ServerMessage; // {msg_type:"", payload: {data, message, type}}
      console.log("Message came in: ", event)
      setEvents(event);
    })
   // close
    socket.addEventListener("close", () => {
      console.log("Socket closed <--")
      setConnected(false)
    })
   // clean up 
    return () => {
      if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [token]);
  
  // sending message to socket server 
  const send = useCallback((message: ClientMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      console.log("Message sent: ", message)
    }
  }, []);

  return { events, connected, send };
}
