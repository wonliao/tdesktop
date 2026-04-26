## ADDED Requirements

### Requirement: Default fast CLI build uses Ninja
The fast build script SHALL use a Ninja build directory as the default CLI build path for macOS arm64 Debug development.

#### Scenario: Configure default fast build
- **WHEN** a developer runs `scripts/build-mac-fast.sh configure`
- **THEN** the script configures `out-fast-arm64-ninja` with the Ninja generator, Debug build type, arm64 architecture, and `TDESKTOP_API_TEST=ON`

#### Scenario: Build default fast target
- **WHEN** a developer runs `scripts/build-mac-fast.sh build`
- **THEN** the script builds the `Telegram` target from `out-fast-arm64-ninja`

### Requirement: Default fast CLI build uses ccache
The fast build script SHALL use `ccache` as the C and C++ compiler launcher for the Ninja fast path by default.

#### Scenario: Configure with ccache available
- **WHEN** `ccache` is discoverable through `command -v ccache`
- **THEN** the script configures `CMAKE_C_COMPILER_LAUNCHER` and `CMAKE_CXX_COMPILER_LAUNCHER` to that executable

#### Scenario: Configure with ccache disabled
- **WHEN** a developer sets `FAST_BUILD_CCACHE=0`
- **THEN** the script configures the Ninja fast path without compiler launcher settings

#### Scenario: Configure with ccache missing
- **WHEN** `ccache` is not discoverable and `FAST_BUILD_CCACHE` is not `0`
- **THEN** the script fails before CMake configure with a clear message explaining how to install or disable ccache

### Requirement: Xcode fast build remains available
The fast build script SHALL keep the existing Xcode arm64 Debug fast build path available through explicit Xcode subcommands.

#### Scenario: Configure Xcode fast build
- **WHEN** a developer runs `scripts/build-mac-fast.sh configure-xcode`
- **THEN** the script configures `out-fast-arm64` with the Xcode generator, Debug configuration, arm64 architecture, code signing disabled, index store disabled, and `TDESKTOP_API_TEST=ON`

#### Scenario: Open Xcode fast project
- **WHEN** a developer runs `scripts/build-mac-fast.sh open-xcode`
- **THEN** the script opens `out-fast-arm64/Telegram.xcodeproj`, configuring it first if needed

### Requirement: Fast build isolation preserves official outputs
The fast build workflow SHALL isolate local fast build artifacts from official build outputs and source files.

#### Scenario: Clean default fast build
- **WHEN** a developer runs `scripts/build-mac-fast.sh clean`
- **THEN** the script deletes only `out-fast-arm64-ninja`

#### Scenario: Clean all fast builds
- **WHEN** a developer runs `scripts/build-mac-fast.sh clean-all`
- **THEN** the script deletes only `out-fast-arm64-ninja` and `out-fast-arm64`

#### Scenario: Official outputs remain untouched
- **WHEN** any fast build command runs
- **THEN** the script does not modify `out/`, `Libraries/`, or Telegram source files
