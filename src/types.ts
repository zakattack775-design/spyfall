// ---- Game phases ----
export type Phase = "lobby" | "playing" | "voting" | "results";

// ---- Game mode ----
export type GameMode = "locations" | "characters";

// ---- Player info ----
export type Player = {
  id: string;
  name: string;
  isHost: boolean;
};

// ---- Messages from CLIENT → SERVER ----
export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "start" }
  | { type: "updateSettings"; gameMode: GameMode; timerEnabled: boolean }
  | { type: "accuse"; accusedId: string }
  | { type: "vote"; guilty: boolean }
  | { type: "playAgain" };

// ---- Messages from SERVER → CLIENT (personalized per player) ----
export type ServerMessage =
  | {
      type: "state";
      phase: "lobby";
      players: Player[];
      you: string; // your player id
      gameMode: GameMode;
      timerEnabled: boolean;
    }
  | {
      type: "state";
      phase: "playing";
      players: Player[];
      you: string;
      location: string | null; // null means you're the spy
      allLocations: string[]; // the spy sees this list to guess from
      gameMode: GameMode;
      timerEndTime: number | null; // Unix timestamp when timer expires, or null
    }
  | {
      type: "state";
      phase: "voting";
      players: Player[];
      you: string;
      accuserId: string;
      accusedId: string;
      votes: Record<string, boolean | null>; // playerId → guilty/not-guilty/hasn't voted
    }
  | {
      type: "state";
      phase: "results";
      players: Player[];
      you: string;
      spyId: string;
      location: string;
      accusedId: string | null;
      spyCaught: boolean;
      gameMode: GameMode;
    }
  | { type: "error"; message: string };
