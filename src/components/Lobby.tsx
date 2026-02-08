import type { Player } from "../types";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

type Props = {
  players: Player[];
  you: string;
  roomCode: string;
  onStart: () => void;
};

export function Lobby({ players, you, roomCode, onStart }: Props) {
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
