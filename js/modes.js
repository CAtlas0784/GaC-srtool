// Server-mode capability matrix.
//
// GaCy GO is the only backend that implements the full tool API
// (/api/status, /api/persistent, /api/inventory, /api/monster-settings,
// /api/battle_report, /api/tool-session ...). FireflyGo is push-only and only
// understands POST /sync, so every feature that needs a read endpoint has to
// disappear from the UI instead of failing at runtime.

export const SERVER_MODES = ['gac', 'firefly', 'robin'];

export const MODE_LABELS = {
  gac: 'GaCy GO',
  firefly: 'FireflyGo',
  robin: 'RobinSR'
};

export const MODE_CAPABILITIES = {
  gac: {
    saveManager: true,
    exranks: true,
    inventory: true,
    monsterSettings: true,
    damageAnalyst: true,
    sceneCard: true,
    gmConsole: true,
    battleSummary: true,
    toolSession: true,
    extraData: false,
    ownedAvatarsOnly: false,
    // data-in-game.json is a FireflyGo artifact, so GaCy keeps only its own
    // freesr/persistent documents visible in the JSON tab.
    jsonModes: ['freesr', 'persistent']
  },
  firefly: {
    saveManager: false,
    exranks: false,
    inventory: false,
    monsterSettings: false,
    damageAnalyst: false,
    sceneCard: false,
    gmConsole: false,
    battleSummary: false,
    toolSession: false,
    extraData: true,
    ownedAvatarsOnly: true,
    jsonModes: ['freesr']
  },
  robin: {
    saveManager: false,
    exranks: false,
    inventory: false,
    monsterSettings: false,
    damageAnalyst: false,
    sceneCard: false,
    gmConsole: false,
    battleSummary: false,
    toolSession: false,
    extraData: false,
    ownedAvatarsOnly: false,
    jsonModes: ['freesr']
  }
};

export function normalizeMode(mode) {
  return MODE_CAPABILITIES[mode] ? mode : 'gac';
}

export function modeCapabilities(mode) {
  return MODE_CAPABILITIES[normalizeMode(mode)];
}

export function modeSupports(feature, mode) {
  return modeCapabilities(mode)[feature] === true;
}
