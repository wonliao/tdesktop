class BaseStageRuntime {
  constructor(root, emit) {
    this.root = root;
    this.emit = emit;
    this.profile = null;
    this.speaking = false;
    this.mouthOpen = 0;
  }

  async load(profile) {
    this.profile = profile;
  }

  reportStatus(detail) {
    this.emit({ type: "status", detail });
  }

  setSpeaking(value) {
    this.speaking = Boolean(value);
  }

  setMouthOpen(value) {
    this.mouthOpen = Math.min(Math.max(Number(value) || 0, 0), 1);
  }

  stop() {
    this.setSpeaking(false);
    this.setMouthOpen(0);
  }

  destroy() {
    this.root.replaceChildren();
  }
}

let globalStatusEmitter = null;

function setGlobalStatusEmitter(emit) {
  globalStatusEmitter = typeof emit === "function" ? emit : null;
}

function emitGlobalStatus(detail) {
  globalStatusEmitter?.({ type: "status", detail });
}

async function withTimeout(label, ms, task) {
  return await Promise.race([
    task(),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms);
    }),
  ]);
}

const stageRuntimeRegistry = new Map();

function registerStageRuntime(id, RuntimeClass) {
  stageRuntimeRegistry.set(id, RuntimeClass);
}

function getStageRuntime(id) {
  return stageRuntimeRegistry.get(id);
}

window.StageRuntimeCore = {
  BaseStageRuntime,
  emitGlobalStatus,
  getStageRuntime,
  registerStageRuntime,
  setGlobalStatusEmitter,
  withTimeout,
};
