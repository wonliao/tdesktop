(function () {
  function finalizeLoadedVrm(gltf, THREE, VRMUtils, scene, options = {}) {
    const vrm = gltf.userData?.vrm;
    if (!vrm) {
      throw new Error("Loaded file is missing VRM data.");
    }

    VRMUtils.removeUnnecessaryVertices(vrm.scene);
    if (typeof VRMUtils.combineSkeletons === "function") {
      VRMUtils.combineSkeletons(vrm.scene);
    } else if (typeof VRMUtils.removeUnnecessaryJoints === "function") {
      VRMUtils.removeUnnecessaryJoints(vrm.scene);
    }

    vrm.scene.traverse((object) => {
      object.frustumCulled = false;
    });

    const vrmGroup = new THREE.Group();
    vrmGroup.add(vrm.scene);
    scene?.add(vrmGroup);
    vrm.springBoneManager?.reset?.();
    vrmGroup.updateMatrixWorld(true);

    const box = computeBoundingBox(THREE, vrm.scene);
    const sceneBootstrap = createSceneBootstrap(THREE, box, vrm, options);

    return {
      gltf,
      vrm,
      vrmGroup,
      sceneBootstrap,
    };
  }

  async function loadVrmModel(modelURL, options = {}) {
    const { scene, onProgress } = options;
    const { THREE, VRMUtils } = await window.VRMRuntimeLoader.ensureVRMDependencies();
    const loader = await window.VRMRuntimeLoader.useVRMLoader();
    let gltf;
    try {
      gltf = await loader.loadAsync(modelURL, (progress) => onProgress?.(progress));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`VRM loader failed for ${modelURL}: ${detail}`);
    }
    return finalizeLoadedVrm(gltf, THREE, VRMUtils, scene, options);
  }

  async function loadVrmModelFromArrayBuffer(modelData, options = {}) {
    const { scene } = options;
    const { THREE, VRMUtils } = await window.VRMRuntimeLoader.ensureVRMDependencies();
    const loader = await window.VRMRuntimeLoader.useVRMLoader();
    let gltf;
    try {
      gltf = await new Promise((resolve, reject) => {
        loader.parse(modelData, "", resolve, reject);
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`VRM buffer parse failed: ${detail}`);
    }
    return finalizeLoadedVrm(gltf, THREE, VRMUtils, scene, options);
  }

  async function loadVrmAnimation(animationURL, vrm, options = {}) {
    const { onProgress } = options;
    const { createVRMAnimationClip } = await window.VRMRuntimeLoader.ensureVRMDependencies();
    const loader = await window.VRMRuntimeLoader.useVRMLoader();
    let gltf;
    try {
      gltf = await loader.loadAsync(animationURL, (progress) => onProgress?.(progress));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`VRMA loader failed for ${animationURL}: ${detail}`);
    }
    const vrmAnimation = gltf.userData?.vrmAnimations?.[0];
    if (!vrmAnimation) {
      throw new Error("Loaded file is missing VRMA animation data.");
    }

    const clip = createVRMAnimationClip(vrmAnimation, vrm);
    if (!clip) {
      throw new Error("Failed to create a VRM animation clip from the VRMA file.");
    }

    return {
      gltf,
      vrmAnimation,
      clip,
    };
  }

  function reAnchorRootPositionTrack(clip, vrm) {
    const hipNode = vrm?.humanoid?.getNormalizedBoneNode?.("hips");
    if (!hipNode) {
      return;
    }

    hipNode.updateMatrixWorld(true);
    const { THREE } = window.VRMStageVendor || globalThis.VRMStageVendor;
    const defaultHipPos = new THREE.Vector3();
    hipNode.getWorldPosition(defaultHipPos);

    const hipsTrack = clip?.tracks?.find((track) =>
      track instanceof THREE.VectorKeyframeTrack && track.name === `${hipNode.name}.position`
    );
    if (!(hipsTrack instanceof THREE.VectorKeyframeTrack)) {
      return;
    }

    const animeDelta = new THREE.Vector3(
      hipsTrack.values[0] - defaultHipPos.x,
      hipsTrack.values[1] - defaultHipPos.y,
      hipsTrack.values[2] - defaultHipPos.z,
    );

    clip.tracks.forEach((track) => {
      if (!(track instanceof THREE.VectorKeyframeTrack) || !track.name.endsWith(".position")) {
        return;
      }

      for (let i = 0; i < track.values.length; i += 3) {
        track.values[i] -= animeDelta.x;
        track.values[i + 1] -= animeDelta.y;
        track.values[i + 2] -= animeDelta.z;
      }
    });
  }

  function computeBoundingBox(THREE, root) {
    const box = new THREE.Box3();
    const childBox = new THREE.Box3();

    root.updateMatrixWorld(true);
    root.traverse((object) => {
      if (!object.visible || !object.isMesh || !object.geometry) {
        return;
      }

      if (object.name?.startsWith?.("VRMC_springBone_collider")) {
        return;
      }

      if (!object.geometry.boundingBox) {
        object.geometry.computeBoundingBox();
      }

      childBox.copy(object.geometry.boundingBox);
      childBox.applyMatrix4(object.matrixWorld);
      box.union(childBox);
    });

    return box;
  }

  function createSceneBootstrap(THREE, box, vrm, options = {}) {
    const modelSize = new THREE.Vector3();
    const modelCenter = new THREE.Vector3();
    const modelOrigin = new THREE.Vector3();
    box.getSize(modelSize);
    box.getCenter(modelCenter);
    modelOrigin.copy(box?.min ?? new THREE.Vector3());

    if (!Number.isFinite(modelSize.x) || modelSize.lengthSq() === 0) {
      modelSize.set(1, 1.8, 1);
      modelCenter.set(0, 0.9, 0);
      modelOrigin.set(-0.5, 0, -0.5);
    }

    const eyeHeight = getEyePosition(vrm) ?? (modelOrigin.y + modelSize.y * 0.78);
    const lookAtTarget = new THREE.Vector3(modelCenter.x, eyeHeight, modelCenter.z);
    const cameraFOV = Number(options.fov) || 40;
    const cameraDistance = computeCameraDistance(modelSize.y, cameraFOV);
    const initialCameraOffset = new THREE.Vector3(
      modelSize.x / 16,
      modelSize.y / 8,
      cameraDistance,
    );

    return {
      cameraDistance,
      cameraFOV,
      eyeHeight,
      initialCameraOffset,
      lookAtTarget,
      modelCenter,
      modelOrigin,
      modelRotationY: 180,
      modelSize,
    };
  }

  function getEyePosition(vrm) {
    const eye = vrm?.humanoid?.getNormalizedBoneNode?.("head");
    if (!eye) {
      return null;
    }

    const { THREE } = window.VRMStageVendor || globalThis.VRMStageVendor;
    const eyePos = new THREE.Vector3();
    eye.getWorldPosition(eyePos);
    return eyePos.y;
  }

  function computeCameraDistance(modelHeight, fov = 40) {
    const radians = (fov / 2 * Math.PI) / 180;
    return -(modelHeight / 3) / Math.tan(radians);
  }

  function clampCameraDistance(loadResult, cameraDistance) {
    const bootstrap = loadResult?.sceneBootstrap;
    if (!bootstrap) {
      return Number(cameraDistance) || -2.75;
    }

    const baseDistance = bootstrap.cameraDistance;
    const minDistance = baseDistance * 1.8;
    const maxDistance = baseDistance * 0.45;
    const resolvedDistance = Number(cameraDistance) || baseDistance;
    return Math.min(Math.max(resolvedDistance, minDistance), maxDistance);
  }

  function cameraOffsetForDistance(THREE, loadResult, cameraDistance) {
    const bootstrap = loadResult?.sceneBootstrap;
    if (!bootstrap) {
      return new THREE.Vector3(0, 0, Number(cameraDistance) || -2.75);
    }

    const distance = clampCameraDistance(loadResult, cameraDistance);
    return new THREE.Vector3(
      bootstrap.initialCameraOffset.x,
      bootstrap.initialCameraOffset.y,
      distance,
    );
  }

  function applyBootstrapPose(loadResult, options = {}) {
    const bootstrap = loadResult?.sceneBootstrap;
    const root = loadResult?.vrmGroup;
    if (!bootstrap || !root) {
      return;
    }

    const rotationX = Number.isFinite(Number(options.rotationX))
      ? Number(options.rotationX)
      : 0;
    const rotationY = Number.isFinite(Number(options.rotationY))
      ? Number(options.rotationY)
      : bootstrap.modelRotationY;
    root.position.set(0, 0, 0);
    root.rotation.set(rotationX * Math.PI / 180, rotationY * Math.PI / 180, 0);
  }

  function frameVrmCamera(camera, loadResult, options = {}) {
    const bootstrap = loadResult?.sceneBootstrap;
    if (!bootstrap) {
      return;
    }

    const lookAtTarget = options.lookAtTarget ?? bootstrap.lookAtTarget ?? bootstrap.modelCenter;
    const cameraOffset = options.cameraOffset ?? bootstrap.initialCameraOffset;
    const nextFov = Number(options.fov) || bootstrap.cameraFOV;
    const shouldUpdateProjection = Boolean(options.updateProjectionMatrix) || camera.fov !== nextFov;
    camera.fov = nextFov;
    camera.position.copy(bootstrap.modelCenter).add(cameraOffset);
    camera.lookAt(lookAtTarget);
    if (shouldUpdateProjection) {
      camera.updateProjectionMatrix();
    }
  }

  window.VRMRuntimeCore = {
    applyBootstrapPose,
    cameraOffsetForDistance,
    clampCameraDistance,
    frameVrmCamera,
    loadVrmAnimation,
    loadVrmModelFromArrayBuffer,
    loadVrmModel,
    reAnchorRootPositionTrack,
  };
})();
