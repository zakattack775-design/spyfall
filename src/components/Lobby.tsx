import type { Player, GameMode } from "../types";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

type Props = {
  players: Player[];
  you: string;
  roomCode: string;
  gameMode: GameMode;
  timerEnabled: boolean;
  onStart: () => void;
  onUpdateSettings: (gameMode: GameMode, timerEnabled: boolean) => void;
};

export function Lobby({
  players,
  you,
  roomCode,
  gameMode,
  timerEnabled,
  onStart,
  onUpdateSettings,
}: Props) {
  const isHost = players.find((p) => p.id === you)?.isHost;
  const canStart = isHost && players.length >= 3;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Room: {roomCode}</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Share this code with friends to join!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Game settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Game Settings
            </h3>

            {/* Mode picker */}
            <div className="flex gap-2">
              <button
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  gameMode === "locations"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                } ${isHost ? "cursor-pointer" : "cursor-default"}`}
                onClick={() =>
                  isHost && onUpdateSettings("locations", timerEnabled)
                }
              >
                Locations
              </button>
              <button
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  gameMode === "characters"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                } ${isHost ? "cursor-pointer" : "cursor-default"}`}
                onClick={() =>
                  isHost && onUpdateSettings("characters", timerEnabled)
                }
              >
                Characters
              </button>
            </div>

            {/* Timer toggle */}
            <div
              className={`flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 ${
                isHost ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={() =>
                isHost && onUpdateSettings(gameMode, !timerEnabled)
              }
            >
              <span className="text-sm">7-minute timer</span>
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  timerEnabled ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    timerEnabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Players list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Players ({players.length})
            </h3>
            <div className="space-y-1">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                >
                  <span>
                    {p.name}
                    {p.id === you && (
                      <span className="text-muted-foreground ml-1">(you)</span>
                    )}
                  </span>
                  {p.isHost && <Badge variant="secondary">Host</Badge>}
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={onStart}
                disabled={!canStart}
              >
                {players.length < 3
                  ? `Need ${3 - players.length} more player${3 - players.length > 1 ? "s" : ""}`
                  : "Start Game"}
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              Waiting for the host to start...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
