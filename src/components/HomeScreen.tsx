import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

type Props = {
  onJoin: (name: string, room: string) => void;
};

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I or O to avoid confusion
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function HomeScreen({ onJoin }: Props) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"choose" | "join">("choose");

  const handleCreate = () => {
    if (!name.trim()) return;
    onJoin(name.trim(), generateRoomCode());
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) return;
    onJoin(name.trim(), roomCode.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">🕵️ Spyfall</CardTitle>
          <CardDescription className="text-base">
            Find the spy before they figure out the location!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />

          {mode === "choose" ? (
            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={handleCreate} disabled={!name.trim()}>
                Create Room
              </Button>
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={() => setMode("join")}
                disabled={!name.trim()}
              >
                Join Room
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Room code (e.g. ABXY)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode("choose")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleJoin}
                  disabled={!name.trim() || roomCode.length < 4}
                  className="flex-1"
                >
                  Join
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
