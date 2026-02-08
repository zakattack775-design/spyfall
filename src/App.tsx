import { useState } from "react";
import { useGameSocket } from "./hooks/useGameSocket";
import { HomeScreen } from "./components/HomeScreen";
import { Lobby } from "./components/Lobby";
import { PlayingScreen } from "./components/PlayingScreen";
import { VotingScreen } from "./components/VotingScreen";
import { ResultsScreen } from "./components/ResultsScreen";

export function App() {
  const [joined, setJoined] = useState<{ name: string; room: string } | null>(null);

  if (!joined) {
    return <HomeScreen onJoin={(name, room) => setJoined({ name, room })} />;
  }

  return <GameRoom name={joined.name} room={joined.room} />;
}

function GameRoom({ name, room }: { name: string; room: string }) {
  const { gameState, error, send } = useGameSocket(room, name);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Connecting...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm z-50">
          {error}
        </div>
      )}

      {gameState.type === "state" && gameState.phase === "lobby" && (
        <Lobby
          players={gameState.players}
          you={gameState.you}
          roomCode={room}
          onStart={() => send({ type: "start" })}
        />
      )}

      {gameState.type === "state" && gameState.phase === "playing" && (
        <PlayingScreen
          players={gameState.players}
          you={gameState.you}
          location={gameState.location}
          allLocations={gameState.allLocations}
          onAccuse={(id) => send({ type: "accuse", accusedId: id })}
        />
      )}

      {gameState.type === "state" && gameState.phase === "voting" && (
        <VotingScreen
          players={gameState.players}
          you={gameState.you}
          accuserId={gameState.accuserId}
          accusedId={gameState.accusedId}
          votes={gameState.votes}
          onVote={(guilty) => send({ type: "vote", guilty })}
        />
      )}

      {gameState.type === "state" && gameState.phase === "results" && (
        <ResultsScreen
          players={gameState.players}
          you={gameState.you}
          spyId={gameState.spyId}
          location={gameState.location}
          accusedId={gameState.accusedId}
          spyCaught={gameState.spyCaught}
          onPlayAgain={() => send({ type: "playAgain" })}
        />
      )}
    </>
  );
}
