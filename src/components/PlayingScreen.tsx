import { useState } from "react";
import type { Player } from "../types";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type Props = {
  players: Player[];
  you: string;
  location: string | null; // null = you're the spy
  allLocations: string[];
  onAccuse: (accusedId: string) => void;
};

export function PlayingScreen({ players, you, location, allLocations, onAccuse }: Props) {
  const [showAccuse, setShowAccuse] = useState(false);
  const isSpy = location === null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Role card */}
        <Card className={isSpy ? "border-spy/50" : "border-safe/50"}>
          <CardHeader className="text-center">
            <CardTitle className={`text-3xl ${isSpy ? "text-spy" : "text-safe"}`}>
              {isSpy ? "You are the Spy!" : location}
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {isSpy
                ? "Figure out the location by asking clever questions!"
                : "Ask questions to find the spy — but don't give away the location!"}
            </p>
          </CardHeader>
        </Card>

        {/* Spy's location reference */}
        {isSpy && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Possible locations:
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
              <h3 className="text-sm font-medium text-muted-foreground">Players</h3>
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
