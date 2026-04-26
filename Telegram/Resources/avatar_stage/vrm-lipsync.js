(function () {
  const VISEME_ALIASES = {
    aa: ["aa", "a", "A", "ah", "Ah"],
    oh: ["oh", "o", "O"],
    ou: ["ou", "u", "U"],
    ee: ["ee", "e", "E"],
    ih: ["ih", "i", "I", "Ih"],
  };

  function setExpressionAliases(expressionManager, aliases, value) {
    for (const name of aliases) {
      try {
        expressionManager.setValue(name, value);
      } catch (_) {}
    }
  }

  function createVRMLipSyncController() {
    const LIP_KEYS = ["A", "E", "I", "O", "U"];
    const BLENDSHAPE_MAP = {
      A: "aa",
      E: "ee",
      I: "ih",
      O: "oh",
      U: "ou",
    };
    const smoothState = { A: 0, E: 0, I: 0, O: 0, U: 0 };
    const ATTACK = 50;
    const RELEASE = 30;
    const CAP = 0.7;
    const SILENCE_VOL = 0.04;
    const SILENCE_GAIN = 0.05;
    const IDLE_MS = 160;
    let smoothed = 0;
    let lastActiveAt = 0;

    return {
      reset() {
        smoothed = 0;
        lastActiveAt = 0;
        for (const key of LIP_KEYS) {
          smoothState[key] = 0;
        }
      },
      update(vrm, analysis, mouthOpen, delta = 0.016) {
        const expressionManager = vrm?.expressionManager;
        if (!expressionManager) {
          return;
        }

        const vowelWeights = analysis?.getVowelWeights?.() ?? null;
        const analysedMouthOpen = analysis?.getMouthOpen?.();
        const fallbackTarget = Math.min(Math.max((Number(mouthOpen) || 0) * 1.22, 0), 1);
        const target = Number.isFinite(analysedMouthOpen)
          ? Math.min(Math.max(analysedMouthOpen, 0), 1)
          : fallbackTarget;

        const rate = 1 - Math.exp(-24 * delta);
        smoothed += (target - smoothed) * rate;

        if (!vowelWeights) {
          const aa = Math.min(smoothed * 1.02, 1.0);
          const oh = Math.min(smoothed * 0.52, 0.55);
          const ou = Math.min(smoothed * 0.28, 0.3);
          const ee = Math.min(smoothed * 0.16, 0.18);

          setExpressionAliases(expressionManager, VISEME_ALIASES.aa, aa);
          setExpressionAliases(expressionManager, VISEME_ALIASES.oh, oh);
          setExpressionAliases(expressionManager, VISEME_ALIASES.ou, ou);
          setExpressionAliases(expressionManager, VISEME_ALIASES.ee, ee);
          setExpressionAliases(expressionManager, VISEME_ALIASES.ih, ee * 0.7);
          return;
        }

        let winner = "I";
        let runner = "E";
        let winnerVal = -Infinity;
        let runnerVal = -Infinity;
        for (const key of LIP_KEYS) {
          const value = Math.max(Number(vowelWeights[key]) || 0, 0);
          if (value > winnerVal) {
            runnerVal = winnerVal;
            runner = winner;
            winnerVal = value;
            winner = key;
          } else if (value > runnerVal) {
            runnerVal = value;
            runner = key;
          }
        }

        const now = performance.now();
        let silent = target < SILENCE_VOL || winnerVal < SILENCE_GAIN;
        if (!silent) {
          lastActiveAt = now;
        }
        if ((now - lastActiveAt) > IDLE_MS) {
          silent = true;
        }

        const targetWeights = { A: 0, E: 0, I: 0, O: 0, U: 0 };
        if (!silent) {
          targetWeights[winner] = Math.min(CAP, winnerVal);
          targetWeights[runner] = Math.min(CAP * 0.5, runnerVal * 0.6);
        }

        for (const key of LIP_KEYS) {
          const from = smoothState[key];
          const to = targetWeights[key];
          const blendRate = 1 - Math.exp(-(to > from ? ATTACK : RELEASE) * delta);
          smoothState[key] = from + (to - from) * blendRate;
          const weight = (smoothState[key] <= 0.01 ? 0 : smoothState[key]) * 0.7;
          const expressionID = BLENDSHAPE_MAP[key];
          setExpressionAliases(expressionManager, VISEME_ALIASES[expressionID], weight);
        }
      },
    };
  }

  window.VRMLipSyncRuntime = {
    createVRMLipSyncController,
  };
})();
