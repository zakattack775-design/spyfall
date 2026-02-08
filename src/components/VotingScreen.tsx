import type { Player } from "../types";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

type Props = {
  players: Player[];
  you: string;
  accuserId: string;
  accusedId: string;
  votes: Record<string, boolean | null>;
  onVote: (guilty: boolean) => void;
};

export function VotingScreen({ players, you, accuserId, accusedId, votes, onVote }: Props) {
  const accuser = players.find((p) => p.id === accuserId);
  const accused = players.find((p) => p.id === accusedId);
  const myVote = votes[you];
  const hasVoted = myVote !== null && myVote !== undefined;

  const votedCount = Object.values(votes).filter((v) => v !== null).length;
  const totalCount = Object.keys(votes).length;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Vote!</CardTitle>
          <p className="text-muted-foreground mt-2">
            <span className="text-foreground font-medium">{accuser?.name}</span>{" "}
            accuses{" "}
            <span className="text-spy font-medium">{accused?.name}</span> of
            being the spy!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vote buttons */}
          {!hasVoted ? (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="destructive"
                size="lg"
                onClick={() => onVote(true)}
              >
                Guilty
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                size="lg"
                onClick={() => onVote(false)}
              >
                Not Guilty
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              You voted: {myVote ? "Guilty" : "Not Guilty"}
            </p>
          )}

          {/* Vote status */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Votes: {votedCount} / {totalCount}
            </p>
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
                <Badge
                  variant={
                    votes[p.id] === null || votes[p.id] === undefined
                      ? "outline"
                      : "secondary"
                  }
                >
                  {votes[p.id] === null || votes[p.id] === undefined
                    ? "..."
                    : "Voted"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
