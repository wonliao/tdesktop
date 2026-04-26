window.Live2DStageLipSync = (() => {
  let profilePromise = null;

  async function loadProfile() {
    if (!profilePromise) {
      profilePromise = fetch("./wlipsync/profile.json").then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load lip sync profile (${response.status})`);
        }

        return await response.json();
      });
    }

    return profilePromise;
  }

  async function createLive2DLipSync(audioContext) {
    const wlipsync = window.WLipSyncStandalone;
    if (wlipsync?.createWLipSyncNode) {
      try {
        const profile = await loadProfile();
        const node = await wlipsync.createWLipSyncNode(audioContext, profile);
        return createWLipSyncAdapter(node, "wlipsync");
      } catch (_) {
        // Fall through to the analyser-based fallback below.
      }
    }

    return createAnalyserLipSync(audioContext);
  }

  function createWLipSyncAdapter(node, mode) {
    const RAW_KEYS = ["A", "E", "I", "O", "U", "S"];
    const RAW_TO_VOWEL = {
      A: "A",
      E: "E",
      I: "I",
      O: "O",
      U: "U",
      S: "I",
    };

    const cap = 0.72;
    const volumeScale = 0.95;
    const volumeExponent = 0.7;
    const mouthUpdateIntervalMs = 40;
    const mouthLerpWindowMs = 110;
    let lastRawMouthOpen = 0;
    let lastRawUpdateMs = 0;
    let smoothedMouthOpen = 0;
    let lastSmoothedMs = 0;

    function now() {
      return typeof performance !== "undefined" ? performance.now() : Date.now();
    }

    function getVowelWeights() {
      const projected = { A: 0, E: 0, I: 0, O: 0, U: 0 };
      const amp = Math.min((node.volume || 0) * volumeScale, 1) ** volumeExponent;

      for (const rawKey of RAW_KEYS) {
        const vowel = RAW_TO_VOWEL[rawKey];
        const rawValue = node.weights?.[rawKey] ?? 0;
        projected[vowel] = Math.max(projected[vowel], Math.min(cap, rawValue * amp));
      }

      return projected;
    }

    function computeMouthOpen() {
      const weights = Object.values(getVowelWeights());
      return weights.length ? Math.max(...weights) : 0;
    }

    function maybeUpdateRawMouthOpen(timestamp) {
      if (lastRawUpdateMs === 0 || timestamp - lastRawUpdateMs >= mouthUpdateIntervalMs) {
        lastRawMouthOpen = computeMouthOpen();
        lastRawUpdateMs = timestamp;
      }
    }

    function getMouthOpen() {
      const timestamp = now();
      maybeUpdateRawMouthOpen(timestamp);

      if (lastSmoothedMs === 0) {
        smoothedMouthOpen = lastRawMouthOpen;
        lastSmoothedMs = timestamp;
        return smoothedMouthOpen;
      }

      const alpha = mouthLerpWindowMs <= 0 ? 1 : Math.min(1, (timestamp - lastSmoothedMs) / mouthLerpWindowMs);
      smoothedMouthOpen += (lastRawMouthOpen - smoothedMouthOpen) * alpha;
      lastSmoothedMs = timestamp;
      return smoothedMouthOpen;
    }

    function connectSource(source) {
      source.connect(node);
    }

    return {
      mode,
      node,
      connectSource,
      getMouthOpen,
      getVowelWeights,
    };
  }

  function createAnalyserLipSync(audioContext) {
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.18;

    const inputGain = audioContext.createGain();
    inputGain.gain.value = 1;
    inputGain.connect(analyser);

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const timeData = new Float32Array(analyser.fftSize);
    const nyquist = audioContext.sampleRate / 2;

    let lastMouthOpen = 0;
    let lastTimestamp = 0;

    function clamp01(value) {
      return Math.min(Math.max(value, 0), 1);
    }

    function now() {
      return typeof performance !== "undefined" ? performance.now() : Date.now();
    }

    function bandEnergy(fromHz, toHz) {
      const fromIndex = Math.max(0, Math.floor((fromHz / nyquist) * frequencyData.length));
      const toIndex = Math.min(frequencyData.length - 1, Math.ceil((toHz / nyquist) * frequencyData.length));
      if (toIndex <= fromIndex) {
        return 0;
      }

      let total = 0;
      for (let index = fromIndex; index <= toIndex; index += 1) {
        total += frequencyData[index];
      }

      return total / ((toIndex - fromIndex + 1) * 255);
    }

    function sample() {
      analyser.getFloatTimeDomainData(timeData);
      analyser.getByteFrequencyData(frequencyData);

      let rms = 0;
      for (let index = 0; index < timeData.length; index += 1) {
        rms += timeData[index] * timeData[index];
      }
      rms = Math.sqrt(rms / timeData.length);

      const bass = bandEnergy(180, 420);
      const low = bandEnergy(420, 760);
      const lowMid = bandEnergy(760, 1300);
      const mid = bandEnergy(1300, 2200);
      const upperMid = bandEnergy(2200, 3200);
      const high = bandEnergy(3200, 4600);

      const loudness = clamp01((rms - 0.006) / 0.105);
      const shapedLoudness = loudness ** 0.62;
      const brightness = clamp01((upperMid + high * 0.85) - (bass * 0.45));
      const roundness = clamp01((bass * 0.95 + low * 0.75) - (upperMid * 0.35 + high * 0.5));
      const openness = clamp01((lowMid * 1.05 + mid * 0.45) - (bass * 0.22));

      const rawWeights = {
        A: shapedLoudness * clamp01(0.18 + openness * 1.18 + lowMid * 0.36 - high * 0.12),
        E: shapedLoudness * clamp01(0.08 + brightness * 0.72 + mid * 0.82 + lowMid * 0.14 - bass * 0.12),
        I: shapedLoudness * clamp01(0.05 + brightness * 1.02 + upperMid * 0.95 + high * 0.35 - low * 0.18),
        O: shapedLoudness * clamp01(0.1 + roundness * 0.96 + lowMid * 0.52 + bass * 0.28 - high * 0.16),
        U: shapedLoudness * clamp01(0.04 + roundness * 1.08 + bass * 0.72 - mid * 0.22 - high * 0.2),
      };

      const total = Object.values(rawWeights).reduce((sum, value) => sum + value, 0);
      const normalizedScale = total > 0.001 ? Math.min(1.9, 1 / total) : 0;
      const weights = {
        A: clamp01(rawWeights.A * normalizedScale * 1.18),
        E: clamp01(rawWeights.E * normalizedScale * 1.18),
        I: clamp01(rawWeights.I * normalizedScale * 1.24),
        O: clamp01(rawWeights.O * normalizedScale * 1.12),
        U: clamp01(rawWeights.U * normalizedScale * 1.06),
      };

      return {
        weights,
        mouthOpen: Math.min(
          1,
          Math.max(
            shapedLoudness * 1.08,
            weights.A * 1.02,
            weights.O * 0.84,
            weights.U * 0.7,
            weights.E * 0.72,
            weights.I * 0.62
          )
        ),
      };
    }

    function getMouthOpen() {
      const timestamp = now();
      const { mouthOpen } = sample();

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
        lastMouthOpen = mouthOpen;
        return mouthOpen;
      }

      const delta = Math.min(Math.max(timestamp - lastTimestamp, 0), 80);
      const alpha = mouthOpen >= lastMouthOpen
        ? Math.min(1, delta / 55)
        : Math.min(1, delta / 135);

      lastMouthOpen += (mouthOpen - lastMouthOpen) * alpha;
      lastTimestamp = timestamp;
      return lastMouthOpen;
    }

    function getVowelWeights() {
      return sample().weights;
    }

    function connectSource(source) {
      source.connect(inputGain);
    }

    return {
      mode: "analyser",
      node: analyser,
      connectSource,
      getMouthOpen,
      getVowelWeights,
    };
  }

  return {
    createLive2DLipSync,
  };
})();
