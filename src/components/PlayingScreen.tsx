import { useState } from "react";
import type { Player, GameMode } from "../types";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useCountdown, formatTime } from "../hooks/useCountdown";

type Props = {
  players: Player[];
  you: string;
  location: string | null; // null = you're the spy
  allLocations: string[];
  gameMode: GameMode;
  timerEndTime: number | null;
  onAccuse: (accusedId: string) => void;
};

export function PlayingScreen({
  players,
  you,
  location,
  allLocations,
  gameMode,
  timerEndTime,
  onAccuse,
}: Props) {
  const [showAccuse, setShowAccuse] = useState(false);
  const isSpy = location === null;
  const remaining = useCountdown(timerEndTime);

  const thingLabel = gameMode === "characters" ? "character" : "location";
  const listLabel =
    gameMode === "characters" ? "Possible characters:" : "Possible locations:";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Timer */}
        {remaining !== null && (
          <div className="text-center">
            {remaining > 0 ? (
              <span
                className={`text-2xl font-mono font-bold ${
                  remaining < 60_000 ? "text-spy" : "text-muted-foreground"
                }`}
              >
                {formatTime(remaining)}
              </span>
            ) : (
              <span className="text-2xl font-bold text-spy">Time's up!</span>
            )}
          </div>
        )}

        {/* Role card */}
        <Card className={isSpy ? "border-spy/50" : "border-safe/50"}>
          <CardHeader className="text-center">
            <CardTitle
              className={`text-3xl ${isSpy ? "text-spy" : "text-safe"}`}
            >
              {isSpy ? "You are the Spy!" : location}
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {isSpy
                ? `Figure out the ${thingLabel} by asking clever questions!`
                : `Ask questions to find the spy — but don't give away the ${thingLabel}!`}
            </p>
          </CardHeader>
        </Card>

        {/* Spy's reference list */}
        {isSpy && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {listLabel}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allLocations.map((loc) => (
                  <span
                    key={loc}
                    className="text-xs bg-secondary rounded-md px-2 py-1"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Players + accuse */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Players
              </h3>
              <Button
                variant={showAccuse ? "secondary" : "destructive"}
                size="sm"
                onClick={() => setShowAccuse(!showAccuse)}
              >
                {showAccuse ? "Cancel" : "Accuse!"}
              </Button>
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
                  {showAccuse && p.id !== you && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onAccuse(p.id)}
                    >
                      Accuse
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
