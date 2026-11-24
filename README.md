# World Wide Worksheet Maker 2000

Printable elementary-math worksheets with answer keys. Live site: GitHub Pages (Settings, Pages, Source: GitHub Actions).

- `python3 build.py` builds the single-file versions (coins embedded).
- `python3 build.py --target site` builds `dist/` for Pages (coins as files).
- `./tests/run_tests.sh` runs every check.
- Developer notes: `CLAUDE.md`; feature list and standards coverage: `notes/`.
- [PRIVACY.md](PRIVACY.md) and [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md) are also shown in the app (links at the bottom of the settings panel). Keep each pair in step: the dialogs are in `src/html/legal.html`.
