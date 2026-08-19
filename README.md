# DSH Session Pins

为 DeepSeek Harness Web UI 增加类似 Codex 的「置顶会话」功能。

> English: add per-session pin/unpin controls to the existing DSH Web UI overflow menu.

## What it adds

- 「置顶会话 / 取消置顶会话」 in each session’s existing three-dot menu.
- A small pin icon in the menu and in the pinned section header.
- Browser-local persistence using `dsh.workspace.pinnedSessions.v1`.
- Pinned sessions before normal workspace groups.
- Pinned sessions first in the flat “single list” view too.
- Idempotent patching, timestamped backups, and a syntax check before the modified bundle is kept.

This does **not** replace DSH, add a server, collect data, or redistribute the upstream compiled bundle.

## Install / apply

The patch targets the installed compiled file, so pass your own path explicitly:

```powershell
node patch/dsh-session-pins-patch.cjs "C:\path\to\dsh-client-ui-workspace\lib\client.js"
node patch/dsh-session-pins-presentation-patch.cjs "C:\path\to\dsh-client-ui-workspace\lib\client.js"
```

Restart DSH Web and refresh `http://127.0.0.1:23188`. Run both scripts again after an upstream package update.

The scripts create a timestamped `.bak-dsh-session-pins-*` copy next to the target and roll back automatically if Node’s syntax check fails.

## Compatibility

Tested with DSH `0.1.0-rc.6` and the official `@deepseek-ai/dsh-client-ui-workspace` compiled bundle. Compiled upstream layouts can change; if an anchor is not found, stop and inspect the new bundle instead of forcing a replacement.

## Development

```bash
npm run check
```

See [community research](docs/COMMUNITY-RESEARCH.md) and [CHANGELOG](CHANGELOG.md).

## License

MIT.
