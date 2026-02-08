import { useState, useCallback } from "react";
import { usePartySocket } from "partysocket/react";
import type { ClientMessage, ServerMessage } from "../types";

/**
 * Hook that connects to the game server via WebSocket.
 * Automatically sends a "join" message when the socket opens.
 * Returns the latest game state and a `send` function for sending actions.
 */
export function useGameSocket(room: string, name: string) {
  const [gameState, setGameState] = useState<ServerMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socket = usePartySocket({
    party: "spyfallserver",
    room,
    onOpen() {
      // Automatically join with our name when the socket connects
      socket.send(JSON.stringify({ type: "join", name }));
    },
    onMessage(event) {
      const msg: ServerMessage = JSON.parse(event.data);
      if (msg.type === "error") {
        setError(msg.message);
        setTimeout(() => setError(null), 3000);
      } else {
        setGameState(msg);
        setError(null);
      }
    },
  });

  const send = useCallback(
    (msg: ClientMessage) => {
      socket.send(JSON.stringify(msg));
    },
    [socket]
  );

  return { gameState, error, send };
}
