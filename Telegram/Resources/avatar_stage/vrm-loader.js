(function () {
  let loader = null;
  let dependencyPromise = null;

  async function ensureVRMDependencies() {
    if (dependencyPromise) {
      return dependencyPromise;
    }

    dependencyPromise = (async () => {
      window.StageRuntimeCore.emitGlobalStatus("Preparing VRM runtime...");
      const vendor = window.VRMStageVendor || globalThis.VRMStageVendor;
      if (!vendor?.THREE || !vendor?.GLTFLoader || !vendor?.VRMLoaderPlugin || !vendor?.VRMUtils || !vendor?.createVRMAnimationClip) {
        throw new Error("VRM vendor bundle is unavailable.");
      }
      return vendor;
    })();

    return dependencyPromise;
  }

  async function useVRMLoader() {
    if (loader) {
      return loader;
    }

    const { GLTFLoader, VRMLoaderPlugin, VRMAnimationLoaderPlugin } = await ensureVRMDependencies();
    loader = new GLTFLoader();
    loader.crossOrigin = "anonymous";
    loader.register((parser) => new VRMLoaderPlugin(parser));
    if (VRMAnimationLoaderPlugin) {
      loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    }
    return loader;
  }

  window.VRMRuntimeLoader = {
    ensureVRMDependencies,
    useVRMLoader,
  };
})();
