## 1. Script Interface

- [x] 1.1 Update `scripts/build-mac-fast.sh` so `configure`, `build`, `reconfigure`, and `clean` operate on `out-fast-arm64-ninja` with the Ninja generator.
- [x] 1.2 Add explicit Xcode commands: `configure-xcode`, `build-xcode`, `reconfigure-xcode`, `open-xcode`, and `clean-xcode`.
- [x] 1.3 Add `clean-all` to delete only `out-fast-arm64-ninja` and `out-fast-arm64`.

## 2. Ninja and ccache Configuration

- [x] 2.1 Configure Ninja with `CMAKE_BUILD_TYPE=Debug`, `CMAKE_OSX_ARCHITECTURES=arm64`, `TDESKTOP_API_TEST=ON`, `DESKTOP_APP_DISABLE_AUTOUPDATE=ON`, and `DESKTOP_APP_DISABLE_CRASH_REPORTS=ON`.
- [x] 2.2 Resolve `ccache` with `command -v ccache` and pass it as both `CMAKE_C_COMPILER_LAUNCHER` and `CMAKE_CXX_COMPILER_LAUNCHER`.
- [x] 2.3 Support `FAST_BUILD_CCACHE=0` to configure without compiler launcher settings.
- [x] 2.4 Fail early with a clear installation or disablement message when `ccache` is required but missing.

## 3. Verification

- [x] 3.1 Run `scripts/build-mac-fast.sh reconfigure` and verify `out-fast-arm64-ninja/build.ninja` exists.
- [x] 3.2 Verify `out-fast-arm64-ninja/CMakeCache.txt` contains Debug, arm64, `TDESKTOP_API_TEST=ON`, and ccache compiler launcher settings.
- [x] 3.3 Run `scripts/build-mac-fast.sh build` and confirm the Ninja `Telegram` build succeeds.
- [x] 3.4 Run a second no-op `scripts/build-mac-fast.sh build` with timing and confirm it does not perform large-scale C++ recompilation.
- [x] 3.5 Run `ccache -s` and confirm cache activity is visible.
- [x] 3.6 Run `scripts/build-mac-fast.sh build-xcode` to confirm the retained Xcode fast path still succeeds.
- [x] 3.7 Verify `git status --short --ignored=matching` shows only intended tracked changes plus ignored `out-fast-*` build artifacts.
