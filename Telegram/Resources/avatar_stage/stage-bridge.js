(function () {
  const root = document.getElementById("stage-root");
  const bootstrap = window.__stageBridgeBootstrap || null;
  const pendingCommands = Array.isArray(window.__pendingStageCommands)
    ? window.__pendingStageCommands
    : [];
  const RUNTIME_WAIT_MS = 4000;
  let bridgeReadyInterval = null;

  const state = {
    profile: null,
    runtime: null,
    loadingOverlay: null,
    loadingCopy: null,
  };

  function ensureLoadingOverlay() {
    if (state.loadingOverlay) {
      return state.loadingOverlay;
    }

    const overlay = document.createElement("div");
    overlay.className = "stage-loading";
    overlay.innerHTML = `
      <div class="stage-loading-shell" aria-hidden="true">
        <div class="stage-loading-grid"></div>
        <div class="stage-loading-orb"></div>
        <div class="stage-loading-silhouette">
          <div class="stage-loading-silhouette-hair"></div>
          <div class="stage-loading-silhouette-neck"></div>
        </div>
        <div class="stage-loading-status">
          <div class="stage-loading-line"></div>
          <div class="stage-loading-copy" data-loading-copy>Preparing stage...</div>
        </div>
      </div>
    `;

    root.appendChild(overlay);
    state.loadingOverlay = overlay;
    state.loadingCopy = overlay.querySelector("[data-loading-copy]");
    return overlay;
  }

  function showLoadingOverlay(detail) {
    bootstrap?.hideBootstrapPlaceholder?.();
    const overlay = ensureLoadingOverlay();
    overlay.classList.add("is-visible");
    if (state.loadingCopy) {
      state.loadingCopy.textContent = detail || "Preparing stage...";
    }
    bootstrap?.updateBootstrapCopy?.(detail || "Preparing stage...");
  }

  function hideLoadingOverlay() {
    state.loadingOverlay?.classList.remove("is-visible");
  }

  function emit(event) {
    bootstrap?.emitStageEvent?.(event);
  }

  function emitStatus(detail) {
    if (state.loadingOverlay?.classList.contains("is-visible")) {
      showLoadingOverlay(detail);
    }
    else if (detail) {
      bootstrap?.updateBootstrapCopy?.(detail);
    }
    emit({ type: "status", detail });
  }

  function reportRuntimeError(detail) {
    bootstrap?.ensureBootstrapPlaceholder?.();
    bootstrap?.updateBootstrapCopy?.(detail);
    emit({
      type: "error",
      detail,
    });
    hideLoadingOverlay();
  }

  function clearBridgeReadyHeartbeat() {
    if (bridgeReadyInterval) {
      window.clearInterval(bridgeReadyInterval);
      bridgeReadyInterval = null;
    }
  }

  function emitBridgeReady(source) {
    bootstrap?.emitBridgeReady?.(source || "stage-bridge");
  }

  function startBridgeReadyHeartbeat() {
    clearBridgeReadyHeartbeat();
    emitBridgeReady("stage-bridge");
    window.setTimeout(function () {
      emitBridgeReady("stage-bridge-retry");
    }, 150);
    window.setTimeout(function () {
      emitBridgeReady("stage-bridge-retry");
    }, 600);
    bridgeReadyInterval = window.setInterval(function () {
      emitBridgeReady("stage-bridge-heartbeat");
    }, 5000);
  }

  window.addEventListener("error", (event) => {
    const detail = event?.error?.stack
      || event?.message
      || "Unknown stage error";
    reportRuntimeError(detail);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    const detail = reason?.stack
      || reason?.message
      || String(reason ?? "Unhandled rejection");
    reportRuntimeError(detail);
  });

  async function drainPendingCommands() {
    if (!pendingCommands.length) {
      return;
    }

    const queued = pendingCommands.splice(0, pendingCommands.length);
    for (const command of queued) {
      await window.stageBridge.handleNativeCommand(command);
    }
  }

  async function waitForRuntimeClass(rendererType, timeoutMs = RUNTIME_WAIT_MS) {
    const startedAt = Date.now();
    while ((Date.now() - startedAt) < timeoutMs) {
      const RuntimeClass = window.StageRuntimeCore?.getStageRuntime?.(rendererType);
      if (RuntimeClass) {
        return RuntimeClass;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
    return window.StageRuntimeCore?.getStageRuntime?.(rendererType) || null;
  }

  async function loadRuntime(profile, allowFallback = true) {
    const rendererType = profile?.rendererType || "placeholder";
    const RuntimeClass = await waitForRuntimeClass(rendererType);
    if (!RuntimeClass) {
      throw new Error(`Unsupported stage runtime: ${rendererType}`);
    }

    showLoadingOverlay(`Preparing ${profile?.name || rendererType}...`);
    emitStatus(`Preparing ${profile?.name || rendererType}...`);
    state.runtime?.destroy?.();
    emitStatus(`Instantiating ${rendererType} runtime...`);
    state.runtime = new RuntimeClass(root, emit);
    state.profile = profile;
    emitStatus(`Loading ${rendererType} runtime...`);
    try {
      await state.runtime.load(profile);
    } catch (error) {
      const fallbackRendererType = profile?.fallbackRendererType;
      if (allowFallback && fallbackRendererType && fallbackRendererType !== rendererType) {
        const detail = error instanceof Error ? error.message : String(error);
        emitStatus(`${rendererType} failed: ${detail}. Falling back to ${fallbackRendererType}...`);
        await loadRuntime({
          name: profile?.fallbackName || "AIRI Avatar",
          rendererType: fallbackRendererType,
        }, false);
        return;
      }
      throw error;
    }
    bootstrap?.markBridgeActive?.();
    hideLoadingOverlay();
    emit({
      type: "loaded",
      rendererType,
      characterName: profile?.name || "Unknown",
    });
  }

  window.stageBridge = {
    async handleNativeCommand(command) {
      try {
        clearBridgeReadyHeartbeat();
        bootstrap?.markBridgeActive?.();
        switch (command.type) {
          case "loadCharacter":
            emitStatus(`Switching to ${command.profile?.name || 'avatar'}...`);
            await loadRuntime(command.profile);
            break;
          case "setSpeaking":
            state.runtime?.setSpeaking(Boolean(command.boolValue));
            break;
          case "setMouthOpen":
            state.runtime?.setMouthOpen(command.doubleValue);
            break;
          case "setSpeechAudio":
            await state.runtime?.setSpeechAudio?.(command.stringValue, command.stringValue2);
            break;
          case "setModelRotationY":
            state.runtime?.setModelRotationY?.(command.doubleValue);
            break;
          case "setVRMPose":
            state.runtime?.setExternalPose?.(
              command.values?.[0],
              command.values?.[1],
              command.values?.[2],
            );
            break;
          case "stop":
            state.runtime?.stop();
            break;
          default:
            break;
        }
      } catch (error) {
        reportRuntimeError(
          error instanceof Error
            ? (error.stack || error.message)
            : String(error)
        );
      }
    },
  };

  bootstrap?.ensureBootstrapPlaceholder?.();
  bootstrap?.markBridgeActive?.();
  bootstrap?.updateBootstrapCopy?.("Bridge online. Waiting for native command...");
  startBridgeReadyHeartbeat();
  void drainPendingCommands();
})();
