const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { after, before, test } = require("node:test");
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require("@firebase/rules-unit-testing");
const { ref, runTransaction, set } = require("firebase/database");

const projectId = "demo-scrytable";
const databaseHost = "127.0.0.1";
const databasePort = 9000;
const rules = fs.readFileSync(
  path.join(__dirname, "..", "firebase-rules-snippet.json"),
  "utf8",
);

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    database: {
      host: databaseHost,
      port: databasePort,
      rules,
    },
  });
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
});

function roomFixture({ format = "commander", turnState = true } = {}) {
  const room = {
    code: "TEST01",
    hostId: "host",
    hostName: "Host",
    format,
    maxPlayers: 4,
    created: 1,
    lastActive: 1,
    currentTurn: "p1",
    turnCycle: 1,
    turnChangedAt: 1,
    turnReady: {},
    players: {
      host: { name: "Host", authUid: "host-uid", team: "B", joined: 1 },
      p1: { name: "Player 1", authUid: "u1", team: "A", joined: 2 },
      p2: { name: "Player 2", authUid: "u2", team: "B", joined: 3 },
      p3: { name: "Player 3", authUid: "u3", team: "A", joined: 4 },
    },
    members: {
      "host-uid": "host",
      u1: "p1",
      u2: "p2",
      u3: "p3",
    },
  };

  if (turnState) {
    room.turnState = {
      currentTurn: "p1",
      turnCycle: 1,
      turnChangedAt: 1,
      turnReady: {},
    };
  }
  return room;
}

async function seedRoom(roomCode, options) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await set(ref(context.database(), `rooms/${roomCode}`), {
      ...roomFixture(options),
      code: roomCode,
    });
  });
}

function turnRef(uid, roomCode) {
  return ref(
    testEnv.authenticatedContext(uid).database(),
    `rooms/${roomCode}/turnState`,
  );
}

function passTurn(current) {
  const state = current || {
    currentTurn: "p1",
    turnCycle: 1,
    turnChangedAt: Date.now(),
    turnReady: {},
  };
  return {
    ...state,
    currentTurn: "p2",
    turnCycle: state.turnCycle || 1,
    turnChangedAt: Date.now(),
    turnReady: {},
  };
}

test("the active player can advance a turn without writing the whole room", async () => {
  await seedRoom("ACT001");
  await assertSucceeds(runTransaction(turnRef("u1", "ACT001"), passTurn));
});

test("an out-of-turn player cannot advance the turn", async () => {
  await seedRoom("OUT001");
  await assertFails(runTransaction(turnRef("u2", "OUT001"), passTurn));
});

test("an active 2HG teammate can ready up for their shared turn", async () => {
  await seedRoom("TEAMOK", { format: "2hg" });
  await assertSucceeds(
    runTransaction(turnRef("u3", "TEAMOK"), (state) => ({
      ...(state || {
        currentTurn: "p1",
        turnCycle: 1,
        turnChangedAt: 1,
        turnReady: {},
      }),
      turnReady: { ...((state && state.turnReady) || {}), p3: true },
    })),
  );
});

test("a teammate on the other 2HG team cannot ready up", async () => {
  await seedRoom("TEAMNO", { format: "2hg" });
  await assertFails(
    runTransaction(turnRef("u2", "TEAMNO"), (state) => ({
      ...(state || {
        currentTurn: "p1",
        turnCycle: 1,
        turnChangedAt: 1,
        turnReady: {},
      }),
      turnReady: { ...((state && state.turnReady) || {}), p2: true },
    })),
  );
});

test("the authenticated host can force-pass when another player is active", async () => {
  await seedRoom("HST001");
  await assertSucceeds(runTransaction(turnRef("host-uid", "HST001"), passTurn));
});

test("a non-member cannot write turn state", async () => {
  await seedRoom("NOM001");
  await assertFails(runTransaction(turnRef("intruder", "NOM001"), passTurn));
});

test("an active player can initialize turnState in a legacy flat-field room", async () => {
  await seedRoom("LEGACY", { turnState: false });
  await assertSucceeds(runTransaction(turnRef("u1", "LEGACY"), passTurn));
});