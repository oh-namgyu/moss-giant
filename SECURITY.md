# Security

## Reporting a problem

Please report vulnerabilities through GitHub's private vulnerability reporting: open the repository's **Security** tab and choose **Report a vulnerability**.

## What the code touches

The film page runs entirely in the browser. It makes no network requests, stores nothing, and asks for no device permissions. A test enforces that the built page embeds no media and contains no network calls.

The tools under `tools/` run on your machine. They start a headless browser on the local page, write to `dist/` and `out/`, and run `ffmpeg` on those files. `FFMPEG` and `CHROME` choose which binaries are executed, so set them only to programs you trust.
