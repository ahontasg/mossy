#!/usr/bin/env bash
# Downloads a pre-built llama-server binary from llama.cpp GitHub releases
# and places it in src-tauri/binaries/ with the Tauri sidecar naming convention.
set -euo pipefail

# --- Config ---
LLAMA_CPP_VERSION="b8287"
BINARIES_DIR="$(cd "$(dirname "$0")/../src-tauri/binaries" && pwd)"

# --- Detect platform ---
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin)
    case "$ARCH" in
      arm64) TARGET_TRIPLE="aarch64-apple-darwin"; ASSET="llama-${LLAMA_CPP_VERSION}-bin-macos-arm64.tar.gz" ;;
      x86_64) TARGET_TRIPLE="x86_64-apple-darwin"; ASSET="llama-${LLAMA_CPP_VERSION}-bin-macos-x64.tar.gz" ;;
      *) echo "Unsupported macOS arch: $ARCH"; exit 1 ;;
    esac
    ;;
  Linux)
    case "$ARCH" in
      x86_64) TARGET_TRIPLE="x86_64-unknown-linux-gnu"; ASSET="llama-${LLAMA_CPP_VERSION}-bin-ubuntu-x64.tar.gz" ;;
      aarch64) TARGET_TRIPLE="aarch64-unknown-linux-gnu"; ASSET="llama-${LLAMA_CPP_VERSION}-bin-ubuntu-arm64.tar.gz" ;;
      *) echo "Unsupported Linux arch: $ARCH"; exit 1 ;;
    esac
    ;;
  *)
    echo "Unsupported OS: $OS"; exit 1
    ;;
esac

DOWNLOAD_URL="https://github.com/ggml-org/llama.cpp/releases/download/${LLAMA_CPP_VERSION}/${ASSET}"
OUTPUT="$BINARIES_DIR/llama-server-${TARGET_TRIPLE}"

if [ -f "$OUTPUT" ]; then
  echo "llama-server already exists at $OUTPUT"
  echo "Delete it first to re-download."
  exit 0
fi

echo "Downloading $ASSET..."
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

curl -fSL "$DOWNLOAD_URL" -o "$TMPDIR/llama.tar.gz"
mkdir -p "$TMPDIR/extract"
tar xzf "$TMPDIR/llama.tar.gz" -C "$TMPDIR/extract"

# Find llama-server binary in extracted files
FOUND="$(find "$TMPDIR/extract" -name 'llama-server' -type f | head -1)"
if [ -z "$FOUND" ]; then
  echo "Error: llama-server binary not found in archive"
  find "$TMPDIR/extract" -type f
  exit 1
fi

cp "$FOUND" "$OUTPUT"
chmod +x "$OUTPUT"

# Copy shared libraries (dylibs/so files)
BIN_DIR="$(dirname "$FOUND")"
for lib in "$BIN_DIR"/*.dylib "$BIN_DIR"/*.so; do
  [ -f "$lib" ] && cp "$lib" "$BINARIES_DIR/"
done

# On macOS, add @executable_path rpath so the binary finds its dylibs
if [ "$OS" = "Darwin" ]; then
  install_name_tool -add_rpath @executable_path "$OUTPUT" 2>/dev/null || true
fi

echo "Installed llama-server to $OUTPUT"
