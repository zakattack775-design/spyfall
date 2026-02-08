// ---- Game phases ----
export type Phase = "lobby" | "playing" | "voting" | "results";

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
    }
  | {
      type: "state";
      phase: "playing";
      players: Player[];
      you: string;
      location: string | null; // null means you're the spy
      allLocations: string[]; // the spy sees this list to guess from
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
    }
  | { type: "error"; message: string };
