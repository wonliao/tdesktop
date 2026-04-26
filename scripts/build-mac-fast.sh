#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
NINJA_BUILD_DIR="$REPO_ROOT/out-fast-arm64-ninja"
XCODE_BUILD_DIR="$REPO_ROOT/out-fast-arm64"
TARGET="${FAST_BUILD_TARGET:-Telegram}"
CONFIG="${FAST_BUILD_CONFIG:-Debug}"
JOBS="${FAST_BUILD_JOBS:-8}"
QT_VERSION="${FAST_BUILD_QT_VERSION:-6.2.13}"
USE_CCACHE="${FAST_BUILD_CCACHE:-1}"

usage() {
  cat <<EOF
Usage: $(basename "$0") [configure|build|reconfigure|clean|configure-xcode|build-xcode|reconfigure-xcode|open-xcode|clean-xcode|clean-all]

Commands:
  configure          Generate or update the Ninja arm64 fast build.
  build              Configure if needed, then build the Telegram target with Ninja.
  reconfigure        Delete and regenerate the Ninja arm64 fast build.
  clean              Delete only the Ninja fast build directory.
  configure-xcode    Generate or update the Xcode arm64 fast project.
  build-xcode        Configure Xcode if needed, then build the Telegram target.
  reconfigure-xcode  Delete and regenerate the Xcode arm64 fast project.
  open-xcode         Open the Xcode fast project, configuring first if needed.
  clean-xcode        Delete only the Xcode fast build directory.
  clean-all          Delete both fast build directories.

Environment:
  FAST_BUILD_JOBS    Parallel build jobs, default: 8
  FAST_BUILD_TARGET  Build target, default: Telegram
  FAST_BUILD_CONFIG  Build configuration, default: Debug
  FAST_BUILD_QT_VERSION  Qt version, default: 6.2.13
  FAST_BUILD_CCACHE  Use ccache for Ninja builds, default: 1; set 0 to disable
EOF
}

configure_ninja() {
  local cmake_args=(
    -S "$REPO_ROOT"
    -B "$NINJA_BUILD_DIR"
    -G Ninja
    -D CMAKE_BUILD_TYPE="$CONFIG" \
    -D CMAKE_OSX_ARCHITECTURES=arm64 \
    -D TDESKTOP_API_TEST=ON \
    -D DESKTOP_APP_DISABLE_AUTOUPDATE=ON \
    -D DESKTOP_APP_DISABLE_CRASH_REPORTS=ON \
    -Werror=dev \
    -Werror=deprecated \
    --warn-uninitialized
  )

  if [[ "$USE_CCACHE" != "0" ]]; then
    local ccache_path
    if ! ccache_path="$(command -v ccache)"; then
      cat >&2 <<EOF
error: ccache is required for the default Ninja fast build.
Install it with: brew install ccache
Or disable it with: FAST_BUILD_CCACHE=0 $0 ${1:-configure}
EOF
      exit 1
    fi
    cmake_args+=(
      -D "CMAKE_C_COMPILER_LAUNCHER=$ccache_path"
      -D "CMAKE_CXX_COMPILER_LAUNCHER=$ccache_path"
    )
  else
    cmake_args+=(
      -U CMAKE_C_COMPILER_LAUNCHER
      -U CMAKE_CXX_COMPILER_LAUNCHER
    )
  fi

  QT="$QT_VERSION" cmake "${cmake_args[@]}"
}

configure_xcode() {
  QT="$QT_VERSION" cmake -S "$REPO_ROOT" -B "$XCODE_BUILD_DIR" -G Xcode \
    -D CMAKE_CONFIGURATION_TYPES="$CONFIG" \
    -D CMAKE_OSX_ARCHITECTURES=arm64 \
    -D CMAKE_XCODE_ATTRIBUTE_ONLY_ACTIVE_ARCH=YES \
    -D CMAKE_XCODE_ATTRIBUTE_CODE_SIGNING_ALLOWED=NO \
    -D CMAKE_XCODE_ATTRIBUTE_COMPILER_INDEX_STORE_ENABLE=NO \
    -D TDESKTOP_API_TEST=ON \
    -D DESKTOP_APP_DISABLE_AUTOUPDATE=ON \
    -D DESKTOP_APP_DISABLE_CRASH_REPORTS=ON \
    -Werror=dev \
    -Werror=deprecated \
    --warn-uninitialized
}

ensure_ninja_configured() {
  if [[ ! -f "$NINJA_BUILD_DIR/build.ninja" ]]; then
    configure_ninja build
  fi
}

ensure_xcode_configured() {
  if [[ ! -d "$XCODE_BUILD_DIR/Telegram.xcodeproj" ]]; then
    configure_xcode
  fi
}

build_ninja() {
  ensure_ninja_configured
  cmake --build "$NINJA_BUILD_DIR" \
    --target "$TARGET" \
    --parallel "$JOBS"
}

build_xcode() {
  ensure_xcode_configured
  cmake --build "$XCODE_BUILD_DIR" \
    --config "$CONFIG" \
    --target "$TARGET" \
    --parallel "$JOBS"
}

case "${1:-build}" in
  configure)
    configure_ninja configure
    ;;
  build)
    build_ninja
    ;;
  reconfigure)
    rm -rf "$NINJA_BUILD_DIR"
    configure_ninja reconfigure
    ;;
  clean)
    rm -rf "$NINJA_BUILD_DIR"
    ;;
  configure-xcode)
    configure_xcode
    ;;
  build-xcode)
    build_xcode
    ;;
  reconfigure-xcode)
    rm -rf "$XCODE_BUILD_DIR"
    configure_xcode
    ;;
  open-xcode)
    ensure_xcode_configured
    open "$XCODE_BUILD_DIR/Telegram.xcodeproj"
    ;;
  clean-xcode)
    rm -rf "$XCODE_BUILD_DIR"
    ;;
  clean-all)
    rm -rf "$NINJA_BUILD_DIR" "$XCODE_BUILD_DIR"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
