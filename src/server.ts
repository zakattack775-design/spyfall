import { Server, type Connection, routePartykitRequest } from "partyserver";
import { LOCATIONS } from "./locations";
import type { ClientMessage, ServerMessage, Player, Phase } from "./types";

// ---- Environment type (Cloudflare bindings) ----
type Env = {
  SpyfallServer: DurableObjectNamespace<SpyfallServer>;
};

// ---- Internal game state (never sent directly to clients) ----
type GameState = {
  phase: Phase;
  players: Map<string, Player>; // connectionId → Player
  spyId: string | null;
  location: string | null;
  accuserId: string | null;
  accusedId: string | null;
  votes: Map<string, boolean | null>; // playerId → vote
};

// ---- The game server ----
export class SpyfallServer extends Server<Env> {
  state: GameState = {
    phase: "lobby",
    players: new Map(),
    spyId: null,
    location: null,
    accuserId: null,
    accusedId: null,
    votes: new Map(),
  };

  // When someone connects, they haven't joined yet — they need to send a "join" message
  onConnect(connection: Connection) {
    // Nothing to do until they send their name
  }

  onClose(connection: Connection) {
    const player = this.state.players.get(connection.id);
    if (!player) return;

    this.state.players.delete(connection.id);

    // If the room is empty, reset everything
    if (this.state.players.size === 0) {
      this.resetGame();
      return;
    }

    // If the host left, assign a new host
    if (player.isHost) {
      const first = this.state.players.values().next().value;
      if (first) first.isHost = true;
    }

    // If we're in the middle of a game and the spy left, end the round
    if (
      this.state.phase !== "lobby" &&
      connection.id === this.state.spyId
    ) {
      this.state.phase = "results";
      this.state.accusedId = null;
      this.broadcastState();
      return;
    }

    // If we're voting and the accused left, go back to playing
    if (
      this.state.phase === "voting" &&
      connection.id === this.state.accusedId
    ) {
      this.state.phase = "playing";
      this.state.accuserId = null;
      this.state.accusedId = null;
      this.state.votes.clear();
    }

    this.broadcastState();
  }

  onMessage(connection: Connection, raw: string | ArrayBuffer) {
    if (typeof raw !== "string") return;

    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    switch (msg.type) {
      case "join":
        this.handleJoin(connection, msg.name);
        break;
      case "start":
        this.handleStart(connection);
        break;
      case "accuse":
        this.handleAccuse(connection, msg.accusedId);
        break;
      case "vote":
        this.handleVote(connection, msg.guilty);
        break;
      case "playAgain":
        this.handlePlayAgain(connection);
        break;
    }
  }

  // ---- Handlers ----

  handleJoin(connection: Connection, name: string) {
    // Don't let someone join twice
    if (this.state.players.has(connection.id)) return;

    // Don't let new players join mid-game
    if (this.state.phase !== "lobby") {
      this.sendTo(connection, {
        type: "error",
        message: "Game already in progress",
      });
      return;
    }

    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) return;

    const isHost = this.state.players.size === 0;
    this.state.players.set(connection.id, {
      id: connection.id,
      name: trimmed,
      isHost,
    });

    this.broadcastState();
  }

  handleStart(connection: Connection) {
    const player = this.state.players.get(connection.id);
    if (!player?.isHost) return;
    if (this.state.phase !== "lobby") return;
    if (this.state.players.size < 3) {
      this.sendTo(connection, {
        type: "error",
        message: "Need at least 3 players to start",
      });
      return;
    }

    // Pick a random spy and location
    const playerIds = [...this.state.players.keys()];
    this.state.spyId = playerIds[Math.floor(Math.random() * playerIds.length)];
    this.state.location =
      LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    this.state.phase = "playing";

    this.broadcastState();
  }

  handleAccuse(connection: Connection, accusedId: string) {
    if (this.state.phase !== "playing") return;
    if (!this.state.players.has(connection.id)) return;
    if (!this.state.players.has(accusedId)) return;
    if (connection.id === accusedId) return; // can't accuse yourself

    this.state.phase = "voting";
    this.state.accuserId = connection.id;
    this.state.accusedId = accusedId;

    // Set up votes — the accuser automatically votes guilty
    this.state.votes.clear();
    for (const id of this.state.players.keys()) {
      this.state.votes.set(id, id === connection.id ? true : null);
    }

    this.broadcastState();
  }

  handleVote(connection: Connection, guilty: boolean) {
    if (this.state.phase !== "voting") return;
    if (!this.state.votes.has(connection.id)) return;

    this.state.votes.set(connection.id, guilty);

    // Check if everyone has voted
    const allVoted = [...this.state.votes.values()].every((v) => v !== null);
    if (allVoted) {
      const guiltyCount = [...this.state.votes.values()].filter(
        (v) => v === true
      ).length;
      const majority = guiltyCount > this.state.players.size / 2;

      if (majority) {
        // The group voted guilty — check if they caught the spy
        const spyCaught = this.state.accusedId === this.state.spyId;
        this.state.phase = "results";
      } else {
        // Not guilty — go back to playing
        this.state.phase = "playing";
        this.state.accuserId = null;
        this.state.accusedId = null;
        this.state.votes.clear();
      }
    }

    this.broadcastState();
  }

  handlePlayAgain(connection: Connection) {
    const player = this.state.players.get(connection.id);
    if (!player?.isHost) return;
    if (this.state.phase !== "results") return;

    this.state.phase = "lobby";
    this.state.spyId = null;
    this.state.location = null;
    this.state.accuserId = null;
    this.state.accusedId = null;
    this.state.votes.clear();

    this.broadcastState();
  }

  // ---- Helpers ----

  resetGame() {
    this.state = {
      phase: "lobby",
      players: new Map(),
      spyId: null,
      location: null,
      accuserId: null,
      accusedId: null,
      votes: new Map(),
    };
  }

  /** Send personalized state to every connected player */
  broadcastState() {
    for (const connection of this.getConnections()) {
      if (!this.state.players.has(connection.id)) continue;
      this.sendState(connection);
    }
  }

  /** Send personalized state to one player */
  sendState(connection: Connection) {
    const players = [...this.state.players.values()];
    const you = connection.id;

    switch (this.state.phase) {
      case "lobby":
        this.sendTo(connection, {
          type: "state",
          phase: "lobby",
          players,
          you,
        });
        break;

      case "playing":
        this.sendTo(connection, {
          type: "state",
          phase: "playing",
          players,
          you,
          location:
            connection.id === this.state.spyId ? null : this.state.location!,
          allLocations: LOCATIONS,
        });
        break;

      case "voting":
        this.sendTo(connection, {
          type: "state",
          phase: "voting",
          players,
          you,
          accuserId: this.state.accuserId!,
          accusedId: this.state.accusedId!,
          votes: Object.fromEntries(this.state.votes),
        });
        break;

      case "results": {
        const spyCaught = this.state.accusedId === this.state.spyId;
        this.sendTo(connection, {
          type: "state",
          phase: "results",
          players,
          you,
          spyId: this.state.spyId!,
          location: this.state.location!,
          accusedId: this.state.accusedId,
          spyCaught,
        });
        break;
      }
    }
  }

  sendTo(connection: Connection, msg: ServerMessage) {
    connection.send(JSON.stringify(msg));
  }
}

// ---- Worker entry point ----
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  },
} satisfies ExportedHandler<Env>;
