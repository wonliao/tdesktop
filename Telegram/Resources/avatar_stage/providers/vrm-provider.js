(function () {
  const stageRuntimeCore = window.StageRuntimeCore;
  if (!stageRuntimeCore?.BaseStageRuntime || typeof stageRuntimeCore.registerStageRuntime !== "function") {
    console.warn("[vrm-provider] StageRuntimeCore unavailable; skipping VRM provider registration.");
    return;
  }

  const { BaseStageRuntime, registerStageRuntime, setGlobalStatusEmitter, withTimeout } = stageRuntimeCore;

  function getLive2DRuntimeSupport() {
    return window.Live2DRuntimeSupport || null;
  }

  function getLive2DStageLipSync() {
    return window.Live2DStageLipSync || null;
  }

  function getVRMRuntimeLoader() {
    return window.VRMRuntimeLoader || null;
  }

  function getVRMRuntimeCore() {
    return window.VRMRuntimeCore || null;
  }

  function getVRMLipSyncRuntime() {
    return window.VRMLipSyncRuntime || null;
  }

  function decodeBase64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  class VrmStageRuntime extends BaseStageRuntime {
    static dragYawDegreesPerPixel() {
      return 0.45;
    }

    static dragPitchDegreesPerPixel() {
      return 0.25;
    }

    static clampPitchDegrees(value) {
      return Math.min(Math.max(value, -89), 89);
    }

    static rendererPixelRatio() {
      return Math.min((window.devicePixelRatio || 1) * 1.25, 2.5);
    }

    static interactionPixelRatio() {
      return Math.min(window.devicePixelRatio || 1, 1.5);
    }

    async load(profile) {
      await super.load(profile);
      setGlobalStatusEmitter(this.emit);
      this.modelRotationX = Number.isFinite(Number(profile.rotationX)) ? Number(profile.rotationX) : 0;
      this.modelRotationY = Number.isFinite(Number(profile.rotationY)) ? Number(profile.rotationY) : 180;
      this.cameraDistance = Number.isFinite(Number(profile.cameraDistance)) ? Number(profile.cameraDistance) : null;
      this.interactionCleanup = null;
      this.interactionState = null;

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
      this.canvasHost = shell.querySelector("[data-canvas-host]");
      this.canvasHost?.classList.add("vrm-interactive");
      this.mouthBar = shell.querySelector("[data-mouth-bar]");
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.clock = null;
      this.vrm = null;
      this.modelOrbitRoot = null;
      this.animationFrame = null;
      this.blobURL = null;
      this.idleAnimationMixer = null;
      this.idleAnimationAction = null;
      this.idleAnimationBlobURL = null;
      this.resizeObserver = null;
      this.pendingWheelDelta = 0;
      this.lastWheelInteractionAt = 0;
      this.needsWheelInteractionCommit = false;
      this.zoomInteractionActiveUntil = 0;
      this.pendingCameraDistance = this.cameraDistance;
      this.needsZoomPreviewRender = false;
      this.lastAppliedPreviewScale = 1;
      this.zoomPreviewImage = null;
      this.zoomPreviewActive = false;
      this.useSnapshotZoomPreview = false;
      this.fpsState = {
        frameCount: 0,
        elapsed: 0,
        lastReported: null,
      };
      this.speechAudioContext = null;
      this.speechLipSync = null;
      this.speechGainNode = null;
      this.speechSourceNode = null;
      this.speechPlaybackEndsAt = 0;

      if (!profile.modelURL && !profile.archiveBase64) {
        this.reportStatus("Choose a VRM file to begin.");
        this.render();
        return;
      }

      this.reportStatus("Resolving VRM file...");
      const vrmRuntimeLoader = getVRMRuntimeLoader();
      const vrmRuntimeCore = getVRMRuntimeCore();
      const runtimeSupport = getLive2DRuntimeSupport();
      const lipSyncRuntime = getVRMLipSyncRuntime();
      if (!vrmRuntimeLoader?.ensureVRMDependencies || !vrmRuntimeCore || !runtimeSupport?.base64ToBlob || !lipSyncRuntime) {
        this.reportStatus("VRM runtime support is unavailable.");
        this.render();
        return;
      }
      await withTimeout("VRM dependency load", 15000, async () => {
        this.vrmDeps = await vrmRuntimeLoader.ensureVRMDependencies();
      });
      this.reportStatus("Building VRM stage...");
      await withTimeout("VRM model build", 20000, async () => {
        await this.mountVRMModel(profile.modelURL);
      });
      this.reportStatus("VRM stage ready.");
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

    stop() {
      this.stopSpeechLipSyncPlayback();
      super.stop();
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
        this.reportStatus(`VRM lip sync audio failed: ${detail}`);
      }
    }

    setModelRotationY(value) {
      this.modelRotationY = Number.isFinite(Number(value)) ? Number(value) : 180;
      this.applyModelTransform();
    }

    setExternalPose(rotationX, rotationY, cameraDistance) {
      this.modelRotationX = VrmStageRuntime.clampPitchDegrees(
        Number.isFinite(Number(rotationX)) ? Number(rotationX) : 0
      );
      this.modelRotationY = Number.isFinite(Number(rotationY)) ? Number(rotationY) : 180;
      if (this.vrmLoadResult) {
        this.cameraDistance = getVRMRuntimeCore().clampCameraDistance(
          this.vrmLoadResult,
          Number(cameraDistance)
        );
        this.pendingCameraDistance = this.cameraDistance;
        this.refreshCameraFraming(false);
      }
      this.applyModelTransform();
      this.emitInteractionChanged();
    }

    async mountVRMModel(modelURL) {
      if (!this.canvasHost) {
        throw new Error("VRM canvas host is missing.");
      }

      const { THREE } = this.vrmDeps;
      this.reportStatus("Creating Three.js renderer...");
      const width = Math.max(this.canvasHost.clientWidth || 180, 180);
      const height = Math.max(this.canvasHost.clientHeight || 180, 180);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(VrmStageRuntime.rendererPixelRatio());
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.canvasHost.replaceChildren(renderer.domElement);
      this.renderer = renderer;
      this.installResizeObserver();

      const scene = new THREE.Scene();
      this.scene = scene;

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 1.35, 3.2);
      this.camera = camera;

      const ambient = new THREE.AmbientLight(0xffffff, 1.15);
      scene.add(ambient);
      const directional = new THREE.DirectionalLight(0xffffff, 1.6);
      directional.position.set(1.2, 2.4, 2.8);
      scene.add(directional);
      const rim = new THREE.DirectionalLight(0x7ab8ff, 0.9);
      rim.position.set(-1.6, 1.1, -2.0);
      scene.add(rim);

      if (this.profile?.archiveBase64) {
        this.reportStatus("Decoding VRM file...");
        const modelBuffer = decodeBase64ToArrayBuffer(this.profile.archiveBase64);
        this.reportStatus(`Decoded VRM file (${modelBuffer.byteLength} bytes).`);
        this.reportStatus("Parsing embedded VRM file...");
        const loadResult = await getVRMRuntimeCore().loadVrmModelFromArrayBuffer(modelBuffer, { scene, fov: camera.fov });
        this.reportStatus("VRM model parsed.");
        this.vrmLoadResult = loadResult;
      } else {
        this.reportStatus("Opening VRM file...");
        this.reportStatus("Loading VRM model...");
        const loadResult = await getVRMRuntimeCore().loadVrmModel(modelURL, { scene, fov: camera.fov });
        this.reportStatus("VRM model parsed.");
        this.vrmLoadResult = loadResult;
      }
      const loadResult = this.vrmLoadResult;
      this.vrm = loadResult.vrm;
      this.modelOrbitRoot = new this.vrmDeps.THREE.Group();
      this.modelOrbitRoot.name = "vrm-orbit-root";
      this.scene.add(this.modelOrbitRoot);
      this.modelOrbitRoot.add(loadResult.vrmGroup);
      this.modelRotationY = Number.isFinite(Number(this.modelRotationY))
        ? Number(this.modelRotationY)
        : Number(loadResult.sceneBootstrap?.modelRotationY) || 0;
      this.cameraDistance = getVRMRuntimeCore().clampCameraDistance(
        loadResult,
        this.cameraDistance ?? loadResult.sceneBootstrap?.cameraDistance
      );
      this.pendingCameraDistance = this.cameraDistance;
      this.clock = new THREE.Clock();
      this.lipSync = getVRMLipSyncRuntime().createVRMLipSyncController();
      this.idleState = this.createIdleState();
      if (this.useSnapshotZoomPreview) {
        this.ensureZoomPreviewImage();
      }
      this.installInteractionHandlers();
      this.applyModelTransform();
      this.reportStatus("Finalizing VRM stage...");
      await this.configureIdleMotion(this.profile?.animationURL);
      this.reportStatus("VRM scene mounted.");
      this.startRenderLoop();
    }

    applyModelTransform() {
      if (!this.vrm || !this.vrmLoadResult || !this.camera || !this.modelOrbitRoot) {
        return;
      }

      this.modelOrbitRoot.position.set(0, 0, 0);
      this.modelOrbitRoot.rotation.set(
        0,
        (this.vrmLoadResult.sceneBootstrap?.modelRotationY ?? 180) * Math.PI / 180,
        0
      );
      this.captureIdleBases();
      this.refreshCameraFraming();
    }

    installInteractionHandlers() {
      if (!this.canvasHost) {
        return;
      }

      this.interactionCleanup?.();
      this.interactionState = {
        dragging: false,
        lastX: 0,
        lastY: 0,
        zooming: false,
      };

      const onPointerDown = (event) => {
        this.interactionState.dragging = true;
        this.interactionState.zooming = Boolean(event.altKey);
        this.interactionState.lastX = event.clientX;
        this.interactionState.lastY = event.clientY;
        this.applyRendererQuality(true);
        this.canvasHost?.classList.add("is-dragging");
        this.canvasHost.setPointerCapture?.(event.pointerId);
      };

      const onPointerMove = (event) => {
        if (!this.interactionState?.dragging) {
          return;
        }

        const deltaX = event.clientX - this.interactionState.lastX;
        const deltaY = event.clientY - this.interactionState.lastY;
        this.interactionState.lastX = event.clientX;
        this.interactionState.lastY = event.clientY;
        this.interactionState.zooming = Boolean(event.altKey) || this.interactionState.zooming;
        if (this.interactionState.zooming && this.vrmLoadResult) {
          this.updatePendingZoomDistance(-deltaY * 0.01);
        } else {
          // Unity Scene view style orbit: horizontal drag controls yaw,
          // vertical drag controls pitch, both around the character pivot.
          this.modelRotationY -= deltaX * VrmStageRuntime.dragYawDegreesPerPixel();
          this.modelRotationX = VrmStageRuntime.clampPitchDegrees(
            this.modelRotationX + deltaY * VrmStageRuntime.dragPitchDegreesPerPixel()
          );
          this.refreshCameraFraming(false);
        }
      };

      const onPointerUp = (event) => {
        const wasDragging = this.interactionState?.dragging;
        const wasZooming = this.interactionState?.zooming;
        this.interactionState.dragging = false;
        this.interactionState.zooming = false;
        this.canvasHost?.classList.remove("is-dragging");
        this.canvasHost.releasePointerCapture?.(event.pointerId);
        if (wasDragging) {
          if (wasZooming) {
            this.commitPendingZoom(true);
          } else {
            this.emitInteractionChanged();
          }
        }
        this.applyRendererQuality(false);
      };

      const onWheel = (event) => {
        event.preventDefault();
        if (!this.vrmLoadResult) {
          return;
        }

        this.pendingWheelDelta -= event.deltaY;
        this.lastWheelInteractionAt = performance.now();
        this.zoomInteractionActiveUntil = this.lastWheelInteractionAt + 120;
        this.needsWheelInteractionCommit = true;
        this.applyRendererQuality(true);
        this.flushPendingZoom();
      };

      this.canvasHost.addEventListener("pointerdown", onPointerDown);
      this.canvasHost.addEventListener("pointermove", onPointerMove);
      this.canvasHost.addEventListener("pointerup", onPointerUp);
      this.canvasHost.addEventListener("pointercancel", onPointerUp);
      this.canvasHost.addEventListener("wheel", onWheel, { passive: false });

      this.interactionCleanup = () => {
        this.canvasHost?.removeEventListener("pointerdown", onPointerDown);
        this.canvasHost?.removeEventListener("pointermove", onPointerMove);
        this.canvasHost?.removeEventListener("pointerup", onPointerUp);
        this.canvasHost?.removeEventListener("pointercancel", onPointerUp);
        this.canvasHost?.removeEventListener("wheel", onWheel);
      };
    }

    installResizeObserver() {
      if (!this.canvasHost || typeof ResizeObserver === "undefined") {
        return;
      }

      this.resizeObserver?.disconnect?.();
      this.resizeObserver = new ResizeObserver(() => {
        this.refreshCameraFraming(true);
      });
      this.resizeObserver.observe(this.canvasHost);
    }

    refreshCameraFraming(syncRendererSize = false) {
      if (!this.renderer || !this.camera || !this.canvasHost || !this.vrmLoadResult) {
        return;
      }

      const width = Math.max(this.canvasHost.clientWidth || 180, 180);
      const height = Math.max(this.canvasHost.clientHeight || 180, 180);
      this.camera.aspect = width / height;
      if (syncRendererSize) {
        this.renderer.setPixelRatio(this.currentRendererPixelRatio());
        this.renderer.setSize(width, height, false);
      }
      const cameraOffset = getVRMRuntimeCore().cameraOffsetForDistance(
        this.vrmDeps.THREE,
        this.vrmLoadResult,
        this.cameraDistance
      );
      const yawDegrees = this.modelRotationY - (this.vrmLoadResult.sceneBootstrap?.modelRotationY ?? 180);
      const orbitalCameraOffset = cameraOffset.clone();
      const radius = orbitalCameraOffset.length();
      const yawRadians = yawDegrees * Math.PI / 180;
      const pitchRadians = this.modelRotationX * Math.PI / 180;
      const planarRadius = Math.cos(pitchRadians) * radius;
      orbitalCameraOffset.set(
        Math.sin(yawRadians) * planarRadius,
        Math.sin(pitchRadians) * radius,
        Math.cos(yawRadians) * planarRadius,
      );

      getVRMRuntimeCore().frameVrmCamera(this.camera, this.vrmLoadResult, {
        cameraOffset: orbitalCameraOffset,
        updateProjectionMatrix: syncRendererSize,
      });
    }

    currentRendererPixelRatio() {
      const interactionActive =
        this.interactionState?.dragging
        || this.needsWheelInteractionCommit
        || performance.now() < this.zoomInteractionActiveUntil;
      return interactionActive
        ? VrmStageRuntime.interactionPixelRatio()
        : VrmStageRuntime.rendererPixelRatio();
    }

    applyRendererQuality(interactionActive) {
      if (!this.renderer || !this.canvasHost) {
        return;
      }

      const width = Math.max(this.canvasHost.clientWidth || 180, 180);
      const height = Math.max(this.canvasHost.clientHeight || 180, 180);
      const nextPixelRatio = interactionActive
        ? VrmStageRuntime.interactionPixelRatio()
        : VrmStageRuntime.rendererPixelRatio();
      this.renderer.setPixelRatio(nextPixelRatio);
      this.renderer.setSize(width, height, false);
      this.refreshCameraFraming(false);
    }

    emitInteractionChanged() {
      this.emit({
        type: "vrmInteractionChanged",
        rotationX: this.modelRotationX,
        rotationY: this.modelRotationY,
        cameraDistance: this.cameraDistance,
      });
    }

    createIdleState() {
      return {
        elapsed: 0,
        rootBasePositionY: 0,
        rootBaseRotationX: 0,
        rootBaseRotationY: 0,
        rootBaseRotationZ: 0,
        chest: this.resolveHumanoidBone("chest") ?? this.resolveHumanoidBone("upperChest") ?? this.resolveHumanoidBone("spine"),
        head: this.resolveHumanoidBone("head"),
        chestBaseRotationX: 0,
        chestBaseRotationY: 0,
        chestBaseRotationZ: 0,
        headBaseRotationX: 0,
        headBaseRotationY: 0,
        headBaseRotationZ: 0,
      };
    }

    async configureIdleMotion(animationURL) {
      this.stopIdleAnimation();

      if (!animationURL || !this.vrm) {
        this.applyDefaultIdlePose();
        this.captureIdleBases();
        return;
      }

      try {
        const { THREE } = this.vrmDeps;
        this.reportStatus("Loading VRM idle animation...");
        const { clip } = await withTimeout("VRM idle animation load", 8000, async () => (
          await getVRMRuntimeCore().loadVrmAnimation(animationURL, this.vrm)
        ));
        getVRMRuntimeCore().reAnchorRootPositionTrack(clip, this.vrm);
        this.idleAnimationMixer = new THREE.AnimationMixer(this.vrm.scene);
        this.idleAnimationAction = this.idleAnimationMixer.clipAction(clip);
        this.idleAnimationAction.play();
        this.reportStatus("VRM idle animation ready.");
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        this.reportStatus(`VRM idle animation unavailable, using fallback pose. ${detail}`);
        this.applyDefaultIdlePose();
        this.captureIdleBases();
      }
    }

    applyDefaultIdlePose() {
      const deg = Math.PI / 180;

      const setRotation = (boneName, x, y, z) => {
        const bone = this.resolveHumanoidBone(boneName);
        if (!bone) {
          return;
        }
        bone.rotation.set(x, y, z);
      };

      setRotation("spine", 4 * deg, 0, 0);
      setRotation("upperChest", 2 * deg, 0, 0);
      setRotation("neck", -2 * deg, 0, 0);
      setRotation("head", -1 * deg, 0, 0);
      setRotation("leftShoulder", 0, 0, 8 * deg);
      setRotation("rightShoulder", 0, 0, -8 * deg);
      setRotation("leftUpperArm", 10 * deg, 0, 34 * deg);
      setRotation("rightUpperArm", 10 * deg, 0, -34 * deg);
      setRotation("leftLowerArm", -18 * deg, 0, 8 * deg);
      setRotation("rightLowerArm", -18 * deg, 0, -8 * deg);
      setRotation("leftHand", 0, 0, 4 * deg);
      setRotation("rightHand", 0, 0, -4 * deg);
    }

    resolveHumanoidBone(boneName) {
      try {
        return this.vrm?.humanoid?.getNormalizedBoneNode?.(boneName) ?? null;
      } catch (_) {
        return null;
      }
    }

    captureIdleBases() {
      if (!this.idleState || !this.vrmLoadResult?.vrmGroup) {
        return;
      }

      const root = this.vrmLoadResult.vrmGroup;
      this.idleState.rootBasePositionY = root.position.y;
      this.idleState.rootBaseRotationX = root.rotation.x;
      this.idleState.rootBaseRotationY = root.rotation.y;
      this.idleState.rootBaseRotationZ = root.rotation.z;

      if (this.idleState.chest) {
        this.idleState.chestBaseRotationX = this.idleState.chest.rotation.x;
        this.idleState.chestBaseRotationY = this.idleState.chest.rotation.y;
        this.idleState.chestBaseRotationZ = this.idleState.chest.rotation.z;
      }

      if (this.idleState.head) {
        this.idleState.headBaseRotationX = this.idleState.head.rotation.x;
        this.idleState.headBaseRotationY = this.idleState.head.rotation.y;
        this.idleState.headBaseRotationZ = this.idleState.head.rotation.z;
      }
    }

    updateIdleMotion(delta) {
      if (this.idleAnimationMixer) {
        this.idleAnimationMixer.update(delta);
        return;
      }

      if (!this.idleState || !this.vrmLoadResult?.vrmGroup) {
        return;
      }

      const idle = this.idleState;
      idle.elapsed += delta;

      const root = this.vrmLoadResult.vrmGroup;
      const talkBoost = this.speaking ? 1.2 : 1;
      const breathe = Math.sin(idle.elapsed * 1.4) * 0.0035 * talkBoost;

      root.position.y = idle.rootBasePositionY + breathe;
      root.rotation.x = idle.rootBaseRotationX;
      root.rotation.y = idle.rootBaseRotationY;
      root.rotation.z = idle.rootBaseRotationZ;

      if (idle.chest) {
        idle.chest.rotation.x = idle.chestBaseRotationX + Math.sin(idle.elapsed * 1.4) * 0.005 * talkBoost;
        idle.chest.rotation.y = idle.chestBaseRotationY;
        idle.chest.rotation.z = idle.chestBaseRotationZ;
      }

      if (idle.head) {
        idle.head.rotation.x = idle.headBaseRotationX + Math.sin(idle.elapsed * 1.1 + 0.4) * 0.004;
        idle.head.rotation.y = idle.headBaseRotationY;
        idle.head.rotation.z = idle.headBaseRotationZ;
      }
    }

    startRenderLoop() {
      if (!this.renderer || !this.scene || !this.camera || !this.clock) {
        return;
      }

      const tick = () => {
        if (!this.renderer || !this.scene || !this.camera || !this.clock) {
          return;
        }
        const delta = this.clock.getDelta();
        this.vrm?.update?.(delta);
        this.updateIdleMotion(delta);
        this.lipSync?.update(this.vrm, this.activeSpeechAnalysis(), this.mouthOpen, delta);
        this.renderer.render(this.scene, this.camera);
        this.commitWheelInteractionIfIdle();
        this.reportFPS(delta);
        this.animationFrame = requestAnimationFrame(tick);
      };

      this.animationFrame = requestAnimationFrame(tick);
    }

    flushPendingZoom() {
      if (!this.vrmLoadResult || !this.pendingWheelDelta) {
        return;
      }

      const accumulatedDelta = this.pendingWheelDelta;
      this.pendingWheelDelta = 0;
      this.updatePendingZoomDistance(accumulatedDelta * 0.0035);
    }

    commitWheelInteractionIfIdle() {
      if (!this.needsWheelInteractionCommit) {
        return;
      }

      if ((performance.now() - this.lastWheelInteractionAt) < 90) {
        return;
      }

      this.needsWheelInteractionCommit = false;
      this.commitPendingZoom(true);
      this.applyRendererQuality(false);
    }

    updatePendingZoomDistance(delta) {
      if (!this.vrmLoadResult) {
        return;
      }

      const baselineDistance =
        this.pendingCameraDistance
        ?? this.cameraDistance
        ?? this.vrmLoadResult.sceneBootstrap?.cameraDistance
        ?? -2.75;
      const nextDistance = baselineDistance + delta;
      this.pendingCameraDistance = getVRMRuntimeCore().clampCameraDistance(this.vrmLoadResult, nextDistance);
      this.zoomInteractionActiveUntil = performance.now() + 120;
      this.cameraDistance = this.pendingCameraDistance;
      this.refreshCameraFraming(false);
    }

    ensureZoomPreviewImage() {
      if (this.zoomPreviewImage || !this.canvasHost) {
        return;
      }

      const image = document.createElement("img");
      image.className = "vrm-zoom-preview";
      image.alt = "";
      image.draggable = false;
      image.hidden = true;
      this.canvasHost.appendChild(image);
      this.zoomPreviewImage = image;
    }

    beginZoomPreviewSession() {
      if (this.zoomPreviewActive) {
        return;
      }

      if (!this.useSnapshotZoomPreview) {
        return;
      }

      this.ensureZoomPreviewImage();
      const previewElement = this.zoomPreviewImage;
      const rendererCanvas = this.renderer?.domElement;
      if (!previewElement || !rendererCanvas) {
        return;
      }

      try {
        previewElement.src = rendererCanvas.toDataURL("image/png");
      } catch (_) {
        previewElement.removeAttribute("src");
      }

      previewElement.hidden = false;
      rendererCanvas.style.visibility = "hidden";
      this.zoomPreviewActive = true;
    }

    renderPendingZoomPreview() {
      if (!this.needsZoomPreviewRender) {
        return;
      }

      this.needsZoomPreviewRender = false;
      this.applyZoomPreviewTransform();
    }

    applyZoomPreviewTransform() {
      const previewElement = this.zoomPreviewActive
        ? this.zoomPreviewImage
        : (this.renderer?.domElement ?? this.canvasHost);
      if (!previewElement || !this.vrmLoadResult) {
        return;
      }

      const actualDistance =
        this.cameraDistance
        ?? this.vrmLoadResult.sceneBootstrap?.cameraDistance
        ?? -2.75;
      const pendingDistance = this.pendingCameraDistance ?? actualDistance;
      if (!Number.isFinite(actualDistance) || !Number.isFinite(pendingDistance) || Math.abs(actualDistance - pendingDistance) < 0.0001) {
        this.clearZoomPreviewTransform();
        return;
      }

      const scale = Math.min(Math.max(Math.abs(actualDistance) / Math.abs(pendingDistance), 0.72), 1.45);
      if (Math.abs(scale - this.lastAppliedPreviewScale) < 0.002) {
        return;
      }
      previewElement.style.transformOrigin = "center center";
      previewElement.style.transform = `scale(${scale})`;
      this.lastAppliedPreviewScale = scale;
    }

    clearZoomPreviewTransform() {
      const previewElements = [this.zoomPreviewImage, this.renderer?.domElement, this.canvasHost];
      previewElements.forEach((previewElement) => {
        if (!previewElement) {
          return;
        }

        previewElement.style.transform = "";
        previewElement.style.transformOrigin = "";
      });
      this.lastAppliedPreviewScale = 1;
    }

    commitPendingZoom(emit = false) {
      if (!this.vrmLoadResult) {
        return;
      }

      const nextDistance = getVRMRuntimeCore().clampCameraDistance(
        this.vrmLoadResult,
        this.pendingCameraDistance ?? this.cameraDistance
      );
      const hasMeaningfulChange =
        Number.isFinite(nextDistance)
        && Number.isFinite(this.cameraDistance)
        ? Math.abs(nextDistance - this.cameraDistance) > 0.0001
        : nextDistance !== this.cameraDistance;

      this.pendingCameraDistance = nextDistance;
      this.needsZoomPreviewRender = false;
      this.clearZoomPreviewTransform();

      if (hasMeaningfulChange) {
        this.cameraDistance = nextDistance;
        this.refreshCameraFraming(false);
      }

      if (emit) {
        this.emitInteractionChanged();
      }

      this.endZoomPreviewSession();
    }

    endZoomPreviewSession() {
      const rendererCanvas = this.renderer?.domElement;
      if (rendererCanvas) {
        rendererCanvas.style.visibility = "";
      }

      if (this.zoomPreviewImage) {
        this.zoomPreviewImage.hidden = true;
        this.zoomPreviewImage.removeAttribute("src");
      }

      this.zoomPreviewActive = false;
    }

    reportFPS(delta) {
      if (!this.fpsState || !Number.isFinite(delta) || delta <= 0) {
        return;
      }

      this.fpsState.frameCount += 1;
      this.fpsState.elapsed += delta;
      const minElapsed = this.fpsState.lastReported == null ? 0.15 : 0.5;
      if (this.fpsState.elapsed < minElapsed) {
        return;
      }

      const fps = this.fpsState.frameCount / this.fpsState.elapsed;
      this.fpsState.frameCount = 0;
      this.fpsState.elapsed = 0;

      if (this.fpsState.lastReported != null && Math.abs(this.fpsState.lastReported - fps) < 0.5) {
        return;
      }

      this.fpsState.lastReported = fps;
      this.emit({
        type: "fps",
        value: fps,
      });
    }

    activeSpeechAnalysis() {
      if (!this.speechLipSync || !this.speaking) {
        return null;
      }

      const now = performance.now();
      if (this.speechPlaybackEndsAt !== 0 && now > this.speechPlaybackEndsAt + 180) {
        return null;
      }

      return this.speechLipSync;
    }

    async prepareSpeechLipSync(base64, mimeType) {
      if (!createLive2DLipSync) {
        throw new Error("Speech lip sync helper is unavailable.");
      }

      const audioContext = await this.ensureSpeechAudioContext();
      const lipSync = await this.ensureSpeechLipSync(audioContext);
      const audioBuffer = await this.decodeSpeechAudio(audioContext, base64, mimeType);
      this.startSpeechLipSyncPlayback(audioContext, lipSync, audioBuffer);
      this.reportStatus("VRM lip sync ready.");
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

      const createLive2DLipSync = getLive2DStageLipSync()?.createLive2DLipSync;
      if (!createLive2DLipSync) {
        throw new Error("VRM lip sync helper is unavailable.");
      }

      this.reportStatus("Loading VRM lip sync analyzer...");
      this.speechLipSync = await createLive2DLipSync(audioContext);
      this.speechGainNode = audioContext.createGain();
      this.speechGainNode.gain.value = 0;
      this.speechLipSync.node.connect(this.speechGainNode);
      this.speechGainNode.connect(audioContext.destination);
      this.reportStatus(`VRM lip sync analyzer ready (${this.speechLipSync.mode || "unknown"}).`);
      return this.speechLipSync;
    }

    async decodeSpeechAudio(audioContext, base64, mimeType) {
      const runtimeSupport = getLive2DRuntimeSupport();
      if (!runtimeSupport?.base64ToBlob) {
        throw new Error("VRM runtime support is unavailable.");
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

    destroy() {
      this.interactionCleanup?.();
      this.interactionCleanup = null;
      this.interactionState = null;
      this.resizeObserver?.disconnect?.();
      this.resizeObserver = null;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      this.pendingWheelDelta = 0;
      this.pendingCameraDistance = this.cameraDistance;
      this.needsZoomPreviewRender = false;
      this.lastAppliedPreviewScale = 1;
      this.zoomInteractionActiveUntil = 0;
      this.clearZoomPreviewTransform();
      this.endZoomPreviewSession();
      if (this.blobURL) {
        URL.revokeObjectURL(this.blobURL);
        this.blobURL = null;
      }
      try {
        this.renderer?.dispose?.();
      } catch (_) {}
      this.stopIdleAnimation();
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
      this.lipSync?.reset?.();
      this.lipSync = null;
      this.idleState = null;
      this.fpsState = null;
      this.modelOrbitRoot?.removeFromParent?.();
      this.modelOrbitRoot = null;
      this.vrmLoadResult?.vrmGroup?.removeFromParent?.();
      this.vrmLoadResult = null;
      this.vrm = null;
      this.clock = null;
      this.camera = null;
      this.scene = null;
      this.renderer = null;
      setGlobalStatusEmitter(null);
      super.destroy();
    }

    stopIdleAnimation() {
      try {
        this.idleAnimationAction?.stop?.();
      } catch (_) {}
      try {
        this.idleAnimationMixer?.stopAllAction?.();
      } catch (_) {}
      this.idleAnimationAction = null;
      this.idleAnimationMixer = null;
      if (this.idleAnimationBlobURL) {
        URL.revokeObjectURL(this.idleAnimationBlobURL);
        this.idleAnimationBlobURL = null;
      }
    }

    render() {
      if (!this.shell || !this.mouthBar) {
        return;
      }

      this.shell.classList.toggle("speaking", this.speaking);
      this.mouthBar.style.width = `${12 + this.mouthOpen * 88}%`;
    }
  }

  registerStageRuntime("vrm", VrmStageRuntime);
})();
