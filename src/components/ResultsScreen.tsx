import type { Player } from "../types";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

type Props = {
  players: Player[];
  you: string;
  spyId: string;
  location: string;
  accusedId: string | null;
  spyCaught: boolean;
  onPlayAgain: () => void;
};

export function ResultsScreen({
  players,
  you,
  spyId,
  location,
  accusedId,
  spyCaught,
  onPlayAgain,
}: Props) {
  const spy = players.find((p) => p.id === spyId);
  const isHost = players.find((p) => p.id === you)?.isHost;

  // If accusedId is null, the spy disconnected
  const spyDisconnected = accusedId === null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle
            className={`text-3xl ${spyCaught ? "text-safe" : "text-spy"}`}
          >
            {spyDisconnected
              ? "The Spy Left!"
              : spyCaught
                ? "Spy Caught!"
                : "Spy Wins!"}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {spyDisconnected
              ? "The spy disconnected before being caught."
              : spyCaught
                ? "The group correctly identified the spy!"
                : "The group accused the wrong person!"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-secondary/50 p-4 space-y-2 text-center">
            <p className="text-sm text-muted-foreground">The spy was</p>
            <p className="text-xl font-bold text-spy">{spy?.name ?? "Unknown"}</p>
            <p className="text-sm text-muted-foreground mt-2">The location was</p>
            <p className="text-xl font-bold text-safe">{location}</p>
          </div>

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
                {p.id === spyId && (
                  <Badge variant="destructive">Spy</Badge>
                )}
              </div>
            ))}
          </div>

          {isHost && (
            <Button className="w-full" size="lg" onClick={onPlayAgain}>
              Play Again
            </Button>
          )}
          {!isHost && (
            <p className="text-center text-muted-foreground text-sm">
              Waiting for the host to start a new round...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
