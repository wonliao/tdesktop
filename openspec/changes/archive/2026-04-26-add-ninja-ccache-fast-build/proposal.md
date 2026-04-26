## Why

The current macOS fast build path uses an Xcode generator and successfully builds arm64 Debug, but a clean build was measured at 857.3 seconds and a no-op rebuild still triggered substantial C++ recompilation. Daily development needs a lower-latency CLI build path optimized for incremental rebuilds on this Apple Silicon machine.

## What Changes

- Add a Ninja-based macOS arm64 Debug fast build path as the default CLI workflow.
- Use `ccache` as the default C and C++ compiler launcher for the Ninja fast path.
- Keep the existing Xcode fast build path available through explicit Xcode subcommands.
- Keep all fast build output isolated under ignored `/out-fast-*/` directories.
- Do not change the official universal `out/` workflow, third-party `Libraries/`, or Telegram source code.

## Capabilities

### New Capabilities

- `build-workflow`: Fast local macOS build workflow for Telegram Desktop development.

### Modified Capabilities

None.

## Impact

- Affected script: `scripts/build-mac-fast.sh`
- Affected generated directories: `out-fast-arm64-ninja` and `out-fast-arm64`
- External tool dependency: `ccache`, discovered through `command -v ccache`
- Existing official release/universal build paths remain unchanged.
