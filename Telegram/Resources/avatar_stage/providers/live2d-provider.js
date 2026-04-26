(function () {
  const stageRuntimeCore = window.StageRuntimeCore;
  if (!stageRuntimeCore?.BaseStageRuntime || typeof stageRuntimeCore.registerStageRuntime !== "function") {
    console.warn("[live2d-provider] StageRuntimeCore unavailable; skipping Live2D provider registration.");
    return;
  }

  const { BaseStageRuntime, registerStageRuntime, setGlobalStatusEmitter, withTimeout } = stageRuntimeCore;
  const DEFAULT_MODEL_SCALE = 1.32;
  const DEFAULT_MODEL_OFFSET_Y = 24;

  function getLive2DRuntimeSupport() {
    return window.Live2DRuntimeSupport || null;
  }

  function getLive2DStageLipSync() {
    return window.Live2DStageLipSync || null;
  }

  function coerceFiniteNumber(value, fallback) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function easeOutQuad(t) {
    return 1 - ((1 - t) * (1 - t));
  }

  const MOUTH_PARAMETER_IDS = [
    "ParamMouthOpenY",
    "PARAM_MOUTH_OPEN_Y",
    "ParamMouthOpen",
    "MouthOpen",
  ];
  const MOUTH_FORM_PARAMETER_IDS = [
    "ParamMouthForm",
    "PARAM_MOUTH_FORM",
    "MouthForm",
  ];

  function normalizeParameterIDs(ids) {
    if (!ids) {
      return [];
    }

    if (Array.isArray(ids)) {
      return ids.map((value) => String(value)).filter(Boolean);
    }

    if (typeof ids.length === "number") {
      return Array.from(ids).map((value) => String(value)).filter(Boolean);
    }

    return [];
  }

  function collectParameterIDs(coreModel) {
    const candidates = [
      coreModel?.parameters?.ids,
      coreModel?.parameterIds,
      coreModel?._parameterIds,
      typeof coreModel?.getParameterIds === "function" ? coreModel.getParameterIds() : null,
    ];

    for (const candidate of candidates) {
      const ids = normalizeParameterIDs(candidate);
      if (ids.length) {
        return ids;
      }
    }

    return [];
  }

  class Live2DStageRuntime extends BaseStageRuntime {
    async load(profile) {
      await super.load(profile);
      setGlobalStatusEmitter(this.emit);
      this.modelScale = DEFAULT_MODEL_SCALE;
      this.modelOffsetY = DEFAULT_MODEL_OFFSET_Y;

      const shell = document.createElement("div");
      shell.className = "avatar-shell live2d-shell";
      shell.innerHTML = `
        <div class="halo"></div>
        <div class="avatar-card live2d-card">
          <div class="live2d-grid"></div>
          <div class="live2d-canvas" data-canvas-host></div>
          <div class="mouth-bar">
            <div class="mouth-bar-fill" data-mouth-bar></div>
          </div>
        </div>
      `;

      this.root.replaceChildren(shell);
      this.shell = shell;
      this.mouthBar = shell.querySelector("[data-mouth-bar]");
      this.canvasHost = shell.querySelector("[data-canvas-host]");
      this.app = null;
      this.model = null;
      this.initialModelWidth = 0;
      this.initialModelHeight = 0;
      this.canvasResizeObserver = null;
      this.transformAnimationFrame = null;
      this.transformAnimationState = null;
      this.motionManagerCleanup = null;
      this.lastLipSyncUpdateAt = 0;
      this.smoothedMouthOpen = 0;
      this.lastAppliedMouthForm = 0;
      this.availableParameterIDs = [];
      this.speechAudioContext = null;
      this.speechLipSync = null;
      this.speechGainNode = null;
      this.speechSourceNode = null;
      this.speechPlaybackEndsAt = 0;

      if (!profile.modelURL && !profile.archiveBase64) {
        this.reportStatus("Choose a Live2D ZIP to begin.");
        this.render();
        return;
      }

      this.reportStatus("Resolving Live2D ZIP...");
      const runtimeSupport = getLive2DRuntimeSupport();
      if (!runtimeSupport?.ensureLive2DDependencies || !runtimeSupport?.base64ToBlob) {
        this.reportStatus("Live2D runtime support is unavailable.");
        this.render();
        return;
      }
      await withTimeout("Live2D dependency load", 15000, async () => {
        await runtimeSupport.ensureLive2DDependencies();
      });
      this.reportStatus("Building Live2D model from ZIP...");
      await withTimeout("Live2D model build", 20000, async () => {
        await this.mountLive2DModel(profile.modelURL);
      });
      this.reportStatus("Live2D stage ready.");
      this.render();
    }

    setSpeaking(value) {
      super.setSpeaking(value);
      this.render();
    }

    setMouthOpen(value) {
      super.setMouthOpen(value);
      this.render();
    }

    async setSpeechAudio(base64, mimeType) {
      if (!base64 || !mimeType) {
        return;
      }

      try {
        await this.prepareSpeechLipSync(base64, mimeType);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        this.reportStatus(`Live2D lip sync audio failed: ${detail}`);
      }
    }

    stop() {
      this.stopSpeechLipSyncPlayback();
      super.stop();
      this.render();
    }

    async mountLive2DModel(modelURL) {
      if (!this.canvasHost) {
        throw new Error("Live2D canvas host is missing.");
      }

      this.destroyLive2DScene();

      this.reportStatus("Creating PIXI canvas...");
      const width = Math.max(this.canvasHost.clientWidth || 180, 180);
      const height = Math.max(this.canvasHost.clientHeight || 180, 180);
      const app = new window.PIXI.Application({
        width,
        height,
        transparent: true,
        autoStart: true,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      this.canvasHost.replaceChildren(app.view);
      this.app = app;
      this.installResizeObserver();

      this.reportStatus("Parsing Live2D ZIP...");
      const live2d = window.PIXI.live2d;
      let zipBlob;
      if (this.profile?.archiveBase64) {
        this.reportStatus("Decoding Live2D ZIP...");
        zipBlob = getLive2DRuntimeSupport().base64ToBlob(this.profile.archiveBase64, "application/zip");
      } else {
        this.reportStatus("Fetching Live2D ZIP...");
        const response = await fetch(modelURL);
        if (!response.ok) {
          throw new Error(`Failed to fetch Live2D ZIP (${response.status})`);
        }
        zipBlob = await response.blob();
        this.reportStatus(`Fetched Live2D ZIP (${zipBlob.size} bytes).`);
      }
      const blobURL = URL.createObjectURL(zipBlob);
      this.blobURL = blobURL;
      this.reportStatus("Loading Live2D ZIP source...");
      let model;
      try {
        model = await live2d.Live2DModel.from(`zip://${blobURL}`);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new Error(`Live2D ZIP parse failed: ${detail}`);
      }
      this.reportStatus("Live2D model parsed.");

      this.model = model;
      model.anchor?.set?.(0.5, 0.5);
      app.stage.addChild(model);
      this.installMotionManagerHook();
      this.reportLipSyncCapabilities();
      this.initialModelWidth = Math.max(model.width || width, 1);
      this.initialModelHeight = Math.max(model.height || height, 1);
      this.applyModelTransform();
      this.reportStatus("Live2D model mounted.");
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => {
          this.applyModelTransform();
        });
      }
      this.requestRender();
    }

    installResizeObserver() {
      if (!this.canvasHost || typeof ResizeObserver !== "function") {
        return;
      }

      this.canvasResizeObserver?.disconnect?.();
      this.canvasResizeObserver = new ResizeObserver(() => {
        if (!this.app || !this.canvasHost) {
          return;
        }
        const width = Math.max(this.canvasHost.clientWidth || 180, 180);
        const height = Math.max(this.canvasHost.clientHeight || 180, 180);
        this.app.renderer.resize(width, height);
        this.applyModelTransform();
      });
      this.canvasResizeObserver.observe(this.canvasHost);
    }

    applyModelTransform() {
      if (!this.model || !this.app) {
        return;
      }

      const width = this.app.renderer.width;
      const height = this.app.renderer.height;
      const baseWidth = Math.max(this.initialModelWidth || this.model.width || width, 1);
      const baseHeight = Math.max(this.initialModelHeight || this.model.height || height, 1);
      const offsetFactor = 2.2;
      const heightScale = (height * 0.95 / baseHeight) * offsetFactor;
      const widthScale = (width * 0.95 / baseWidth) * offsetFactor;
      let scale = Math.min(heightScale, widthScale);
      if (!Number.isFinite(scale) || scale <= 0) {
        scale = 1e-6;
      }
      scale *= this.modelScale;
      this.applyTransformAnimated({
        scale,
        x: width / 2,
        y: height + this.modelOffsetY,
      });
    }

    applyTransformAnimated(target) {
      if (!this.model) {
        return;
      }

      const nextTarget = {
        scale: target.scale,
        x: target.x,
        y: target.y,
      };

      const current = this.transformAnimationState?.current || {
        scale: this.model.scale.x || 1,
        x: this.model.x || 0,
        y: this.model.y || 0,
      };

      if (this.transformAnimationFrame) {
        cancelAnimationFrame(this.transformAnimationFrame);
        this.transformAnimationFrame = null;
      }

      const nearlyEqual = (a, b) => Math.abs(a - b) < 0.001;
      if (nearlyEqual(current.scale, nextTarget.scale)
        && nearlyEqual(current.x, nextTarget.x)
        && nearlyEqual(current.y, nextTarget.y)) {
        this.model.scale.set(nextTarget.scale, nextTarget.scale);
        this.model.x = nextTarget.x;
        this.model.y = nextTarget.y;
        this.transformAnimationState = {
          current: nextTarget,
          target: nextTarget,
        };
        this.requestRender();
        return;
      }

      const start = {
        scale: current.scale,
        x: current.x,
        y: current.y,
      };
      const startTime = performance.now();
      const duration = 200;

      this.transformAnimationState = {
        current: start,
        target: nextTarget,
      };

      const tick = (now) => {
        if (!this.model) {
          return;
        }

        const progress = Math.min(Math.max((now - startTime) / duration, 0), 1);
        const eased = easeOutQuad(progress);
        const interpolated = {
          scale: start.scale + ((nextTarget.scale - start.scale) * eased),
          x: start.x + ((nextTarget.x - start.x) * eased),
          y: start.y + ((nextTarget.y - start.y) * eased),
        };

        this.model.scale.set(interpolated.scale, interpolated.scale);
        this.model.x = interpolated.x;
        this.model.y = interpolated.y;
        this.transformAnimationState = {
          current: interpolated,
          target: nextTarget,
        };
        this.requestRender();

        if (progress < 1) {
          this.transformAnimationFrame = requestAnimationFrame(tick);
        } else {
          this.transformAnimationFrame = null;
          this.transformAnimationState = {
            current: nextTarget,
            target: nextTarget,
          };
        }
      };

      this.transformAnimationFrame = requestAnimationFrame(tick);
    }

    installMotionManagerHook() {
      const internalModel = this.model?.internalModel;
      const motionManager = internalModel?.motionManager;
      const coreModel = internalModel?.coreModel;
      if (!motionManager || !coreModel || typeof motionManager.update !== "function") {
        return;
      }

      const originalUpdate = motionManager.update.bind(motionManager);
      motionManager.update = (model, now) => {
        const handled = originalUpdate(model, now);
        this.applyLipSyncParametersToModel(coreModel, now);
        return handled;
      };

      this.motionManagerCleanup = () => {
        motionManager.update = originalUpdate;
      };
    }

    reportLipSyncCapabilities() {
      const coreModel = this.model?.internalModel?.coreModel;
      if (!coreModel) {
        return;
      }

      this.availableParameterIDs = collectParameterIDs(coreModel);
      const mouthOpenMatches = MOUTH_PARAMETER_IDS.filter((parameterID) => this.availableParameterIDs.includes(parameterID));
      const mouthFormMatches = MOUTH_FORM_PARAMETER_IDS.filter((parameterID) => this.availableParameterIDs.includes(parameterID));

      if (mouthOpenMatches.length || mouthFormMatches.length) {
        this.reportStatus(
          `Live2D lip sync params: open=[${mouthOpenMatches.join(", ") || "none"}], form=[${mouthFormMatches.join(", ") || "none"}]`
        );
        return;
      }

      const preview = this.availableParameterIDs.slice(0, 16).join(", ");
      this.reportStatus(
        `Live2D model has no standard mouth params. Found: ${preview || "parameter list unavailable"}`
      );
    }

    computeLipSyncState(now = performance.now()) {
      const timestamp = Number.isFinite(now) ? now : performance.now();
      const rawDelta = this.lastLipSyncUpdateAt > 0 ? timestamp - this.lastLipSyncUpdateAt : 16;
      const delta = Math.min(Math.max(rawDelta, 0), 80);
      this.lastLipSyncUpdateAt = timestamp;

      let target = Math.min(Math.max(Number(this.mouthOpen) || 0, 0), 1);
      let vowelWeights = null;
      const hasSpeechAnalysis = this.speechLipSync
        && this.speaking
        && (this.speechPlaybackEndsAt === 0 || timestamp <= this.speechPlaybackEndsAt + 180);

      if (hasSpeechAnalysis) {
        target = Math.min(Math.max(this.speechLipSync.getMouthOpen() || 0, 0), 1);
        vowelWeights = this.speechLipSync.getVowelWeights?.() ?? null;
      }

      const attackWindow = 65;
      const releaseWindow = 140;
      const smoothingWindow = target >= this.smoothedMouthOpen ? attackWindow : releaseWindow;
      const alpha = smoothingWindow <= 0 ? 1 : Math.min(1, delta / smoothingWindow);
      this.smoothedMouthOpen += (target - this.smoothedMouthOpen) * alpha;

      const mouthFormTarget = this.speaking
        ? this.computeMouthFormTarget(vowelWeights)
        : 0;
      this.lastAppliedMouthForm += (mouthFormTarget - this.lastAppliedMouthForm) * Math.min(1, delta / 120);

      return {
        mouthOpen: Math.min(Math.max(this.smoothedMouthOpen, 0), 1),
        mouthForm: Math.min(Math.max(this.lastAppliedMouthForm, -1), 1),
      };
    }

    computeMouthFormTarget(vowelWeights) {
      if (vowelWeights) {
        const wide = (vowelWeights.E || 0) * 0.82 + (vowelWeights.I || 0) * 1.05;
        const round = (vowelWeights.O || 0) * 0.9 + (vowelWeights.U || 0) * 1.08;
        const openAssist = (vowelWeights.A || 0) * 0.08;
        return Math.min(Math.max(wide - round + openAssist, -0.58), 0.58);
      }

      return Math.min(Math.max((this.smoothedMouthOpen - 0.18) * 0.55, -0.18), 0.32);
    }

    async prepareSpeechLipSync(base64, mimeType) {
      const createLive2DLipSync = getLive2DStageLipSync()?.createLive2DLipSync;
      if (!createLive2DLipSync) {
        throw new Error("Live2D lip sync helper is unavailable.");
      }

      const audioContext = await this.ensureSpeechAudioContext();
      const lipSync = await this.ensureSpeechLipSync(audioContext);
      const audioBuffer = await this.decodeSpeechAudio(audioContext, base64, mimeType);
      this.startSpeechLipSyncPlayback(audioContext, lipSync, audioBuffer);
      this.reportStatus("Live2D lip sync ready.");
    }

    async ensureSpeechAudioContext() {
      if (!this.speechAudioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error("This browser does not support AudioContext.");
        }

        this.speechAudioContext = new AudioContextClass();
      }

      if (this.speechAudioContext.state === "suspended") {
        await this.speechAudioContext.resume();
      }

      return this.speechAudioContext;
    }

    async ensureSpeechLipSync(audioContext) {
      if (this.speechLipSync) {
        return this.speechLipSync;
      }

      this.reportStatus("Loading Live2D lip sync analyzer...");
      this.speechLipSync = await createLive2DLipSync(audioContext);
      this.speechGainNode = audioContext.createGain();
      this.speechGainNode.gain.value = 0;
      this.speechLipSync.node.connect(this.speechGainNode);
      this.speechGainNode.connect(audioContext.destination);
      this.reportStatus(`Live2D lip sync analyzer ready (${this.speechLipSync.mode || "unknown"}).`);
      return this.speechLipSync;
    }

    async decodeSpeechAudio(audioContext, base64, mimeType) {
      const runtimeSupport = getLive2DRuntimeSupport();
      if (!runtimeSupport?.base64ToBlob) {
        throw new Error("Live2D runtime support is unavailable.");
      }

      const blob = runtimeSupport.base64ToBlob(base64, mimeType);
      const arrayBuffer = await blob.arrayBuffer();
      return await audioContext.decodeAudioData(arrayBuffer.slice(0));
    }

    startSpeechLipSyncPlayback(audioContext, lipSync, audioBuffer) {
      this.stopSpeechLipSyncPlayback();

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      lipSync.connectSource(source);
      source.start();
      source.onended = () => {
        if (this.speechSourceNode === source) {
          this.speechSourceNode = null;
          this.speechPlaybackEndsAt = performance.now();
        }
      };

      this.speechSourceNode = source;
      this.speechPlaybackEndsAt = performance.now() + audioBuffer.duration * 1000;
    }

    stopSpeechLipSyncPlayback() {
      if (!this.speechSourceNode) {
        return;
      }

      try {
        this.speechSourceNode.stop();
      } catch (_) {}

      try {
        this.speechSourceNode.disconnect();
      } catch (_) {}

      this.speechSourceNode = null;
      this.speechPlaybackEndsAt = 0;
    }

    applyLipSyncParametersToModel(coreModel, now = performance.now()) {
      if (!coreModel) {
        return;
      }

      const { mouthOpen, mouthForm } = this.computeLipSyncState(now);

      const applyValue = (parameterID, value) => {
        try {
          if (typeof coreModel.addParameterValueById === "function") {
            coreModel.addParameterValueById(parameterID, value, 1);
            return true;
          }

          if (typeof coreModel.setParameterValueById === "function") {
            coreModel.setParameterValueById(parameterID, value);
            return true;
          }
        } catch (_) {
          return false;
        }

        return false;
      };

      for (const parameterID of MOUTH_PARAMETER_IDS) {
        applyValue(parameterID, mouthOpen);
      }

      for (const parameterID of MOUTH_FORM_PARAMETER_IDS) {
        applyValue(parameterID, mouthForm);
      }
    }

    destroyLive2DScene() {
      this.canvasResizeObserver?.disconnect?.();
      this.canvasResizeObserver = null;
      if (this.transformAnimationFrame) {
        cancelAnimationFrame(this.transformAnimationFrame);
        this.transformAnimationFrame = null;
      }
      this.transformAnimationState = null;
      this.motionManagerCleanup?.();
      this.motionManagerCleanup = null;
      this.lastLipSyncUpdateAt = 0;
      this.smoothedMouthOpen = 0;
      this.lastAppliedMouthForm = 0;
      this.availableParameterIDs = [];
      this.stopSpeechLipSyncPlayback();
      try {
        this.speechLipSync?.node?.disconnect?.();
      } catch (_) {}
      try {
        this.speechGainNode?.disconnect?.();
      } catch (_) {}
      this.speechLipSync = null;
      this.speechGainNode = null;
      if (this.speechAudioContext) {
        this.speechAudioContext.close?.().catch?.(() => {});
      }
      this.speechAudioContext = null;

      if (this.blobURL) {
        URL.revokeObjectURL(this.blobURL);
        this.blobURL = null;
      }

      try {
        this.model?.destroy?.();
      } catch (_) {}

      try {
        this.app?.destroy(true, { children: true, texture: false, baseTexture: false });
      } catch (_) {}

      this.model = null;
      this.initialModelWidth = 0;
      this.initialModelHeight = 0;
      this.app = null;
    }

    destroy() {
      setGlobalStatusEmitter(null);
      this.destroyLive2DScene();
      super.destroy();
    }

    requestRender() {
      if (!this.app?.renderer || !this.app?.stage) {
        return;
      }

      const renderNow = () => {
        try {
          this.app.ticker?.update?.();
          this.applyLipSyncParametersToModel(this.model?.internalModel?.coreModel);
          this.model?.parent?.updateTransform?.();
          this.model?.updateTransform?.();
          this.app.stage.updateTransform?.();
          if (typeof this.app.render === "function") {
            this.app.render();
          } else {
            this.app.renderer.render(this.app.stage);
          }
        } catch (_) {}
      };

      renderNow();

      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => {
          renderNow();
        });
      }
    }

    render() {
      if (!this.shell || !this.mouthBar) {
        return;
      }

      this.shell.classList.toggle("speaking", this.speaking);
      this.mouthBar.style.width = `${12 + this.mouthOpen * 88}%`;
      this.requestRender();
    }
  }

  registerStageRuntime("live2d", Live2DStageRuntime);
})();
