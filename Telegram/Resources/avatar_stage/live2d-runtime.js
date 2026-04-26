const FILE_PATH_SPLIT_PATTERN = /[\\/]/;
const MOC_FILE_SUFFIX_PATTERN = /\.moc3?/;
let zipLoaderConfigured = false;
const scriptPromises = new Map();

function loadScriptOnce(src) {
  if (scriptPromises.has(src)) {
    return scriptPromises.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      if (existing.dataset.loaded === "true") {
        resolve();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });

  scriptPromises.set(src, promise);
  return promise;
}

function basename(path) {
  return path.split(FILE_PATH_SPLIT_PATTERN).pop();
}

function isIgnoredZipPath(file) {
  const normalized = file.replaceAll("\\\\", "/");
  return normalized.startsWith("__MACOSX/")
    || normalized.includes("/__MACOSX/")
    || basename(normalized).startsWith("._")
    || basename(normalized) === ".DS_Store";
}

function isSettingsFile(file) {
  return file.endsWith(".model3.json") || file.endsWith(".model.json");
}

function isMocFile(file) {
  return file.endsWith(".moc3");
}

function base64ToBlob(base64, mimeType) {
  const binary = atob(base64);
  const length = binary.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

function createFakeSettings(files, Cubism4ModelSettings) {
  const filteredFiles = files.filter((file) => !isIgnoredZipPath(file));
  const mocFiles = filteredFiles.filter((file) => isMocFile(file));
  if (mocFiles.length !== 1) {
    const fileList = mocFiles.length ? `(${mocFiles.map((f) => `"${f}"`).join(",")})` : "";
    throw new Error(`Expected exactly one moc file, got ${mocFiles.length} ${fileList}`);
  }

  const mocFile = mocFiles[0];
  const modelName = basename(mocFile).replace(MOC_FILE_SUFFIX_PATTERN, "");
  const textures = filteredFiles.filter((f) => f.endsWith(".png"));
  if (!textures.length) {
    throw new Error("Textures not found in ZIP.");
  }

  const motions = filteredFiles.filter((f) => f.endsWith(".mtn") || f.endsWith(".motion3.json"));
  const physics = filteredFiles.find((f) => f.includes("physics"));
  const pose = filteredFiles.find((f) => f.includes("pose"));

  const settings = new Cubism4ModelSettings({
    url: `${modelName}.model3.json`,
    Version: 3,
    FileReferences: {
      Moc: mocFile,
      Textures: textures,
      Physics: physics,
      Pose: pose,
      Motions: motions.length ? { "": motions.map((motion) => ({ File: motion })) } : undefined,
    },
  });

  settings.name = modelName;
  settings._objectURL = `airi-zip://${settings.url}`;
  return settings;
}

function configureLive2DZipLoader() {
  if (zipLoaderConfigured) {
    return;
  }

  const live2d = window.PIXI?.live2d;
  const ZipLoader = live2d?.ZipLoader;
  const Cubism4ModelSettings = live2d?.Cubism4ModelSettings;
  if (!ZipLoader || !Cubism4ModelSettings || !window.JSZip) {
    throw new Error("Live2D ZIP loader dependencies are incomplete.");
  }

  ZipLoader.zipReader = (data, _url) => window.JSZip.loadAsync(data);

  const defaultCreateSettings = ZipLoader.createSettings;
  ZipLoader.createSettings = async (reader) => {
    const filePaths = Object.keys(reader.files).filter((file) => !isIgnoredZipPath(file));
    if (!filePaths.some((file) => isSettingsFile(file))) {
      return createFakeSettings(filePaths, Cubism4ModelSettings);
    }
    return defaultCreateSettings(reader);
  };

  ZipLoader.readText = (jsZip, path) => {
    const file = jsZip.file(path);
    if (!file) {
      throw new Error(`Cannot find file in ZIP: ${path}`);
    }
    return file.async("text");
  };

  ZipLoader.getFilePaths = (jsZip) => {
    const paths = [];
    jsZip.forEach((relativePath) => {
      if (!isIgnoredZipPath(relativePath)) {
        paths.push(relativePath);
      }
    });
    return Promise.resolve(paths);
  };

  ZipLoader.getFiles = (jsZip, paths) =>
    Promise.all(
      paths.map(async (path) => {
        const fileName = path.slice(path.lastIndexOf("/") + 1);
        const blob = await jsZip.file(path).async("blob");
        const file = new File([blob], fileName);
        Object.defineProperty(file, "webkitRelativePath", {
          value: path,
        });
        return file;
      }),
    );

  zipLoaderConfigured = true;
}

async function ensureLive2DDependencies() {
  const { emitGlobalStatus } = window.StageRuntimeCore;
  emitGlobalStatus("Loading pixi.js...");
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js");
  emitGlobalStatus("Loading Live2D Cubism Core...");
  await loadScriptOnce("https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js");
  emitGlobalStatus("Loading pixi-live2d-display...");
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/cubism4.min.js");
  emitGlobalStatus("Loading JSZip...");
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js");

  if (!window.PIXI?.live2d?.Live2DModel) {
    throw new Error("Live2D runtime dependencies loaded, but Live2DModel is still unavailable.");
  }

  configureLive2DZipLoader();
}

window.Live2DRuntimeSupport = {
  base64ToBlob,
  ensureLive2DDependencies,
};
