#!/usr/bin/env bash
# Installs what tests/clip.py needs: Playwright for Python and Chromium with system dependencies.
set -e
python3 -m pip install playwright
python3 -m playwright install --with-deps chromium
