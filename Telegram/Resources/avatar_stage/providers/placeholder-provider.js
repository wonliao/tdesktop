(function () {
  const stageRuntimeCore = window.StageRuntimeCore;
  if (!stageRuntimeCore?.BaseStageRuntime || typeof stageRuntimeCore.registerStageRuntime !== "function") {
    console.warn("[placeholder-provider] StageRuntimeCore unavailable; skipping placeholder provider registration.");
    return;
  }

  const { BaseStageRuntime, registerStageRuntime } = stageRuntimeCore;

  class PlaceholderStageRuntime extends BaseStageRuntime {
    async load(profile) {
      await super.load(profile);

      const shell = document.createElement("div");
      shell.className = "avatar-shell";

      shell.innerHTML = `
        <div class="halo"></div>
        <div class="avatar-card">
          <div class="avatar-face">
            <div class="eye left"></div>
            <div class="eye right"></div>
            <div class="mouth-frame">
              <div class="mouth" data-mouth></div>
            </div>
          </div>
          <div class="badge" data-badge>placeholder runtime</div>
        </div>
      `;

      this.root.replaceChildren(shell);
      this.shell = shell;
      this.mouth = shell.querySelector("[data-mouth]");
      this.mouthFrame = shell.querySelector(".mouth-frame");
      this.badge = shell.querySelector("[data-badge]");
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
      super.stop();
      this.render();
    }

    render() {
      if (!this.shell || !this.mouth || !this.mouthFrame || !this.badge) {
        return;
      }

      const mouthHeight = 6 + this.mouthOpen * 24;
      const mouthWidth = 44 + this.mouthOpen * 10;
      this.mouth.style.height = `${mouthHeight}px`;
      this.mouthFrame.style.width = `${mouthWidth}px`;
      this.shell.classList.toggle("speaking", this.speaking);
      this.badge.textContent = this.speaking
        ? `${this.profile?.name ?? "placeholder"} ${(this.mouthOpen * 100).toFixed(0)}%`
        : `${this.profile?.name ?? "placeholder"} runtime`;
    }
  }

  registerStageRuntime("placeholder", PlaceholderStageRuntime);
})();
