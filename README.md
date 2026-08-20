# DSH 会话置顶插件

[npm 包主页](https://www.npmjs.com/package/dsh-session-pins) · [GitHub 仓库](https://github.com/JINGMINGRUO/dsh-session-pins)

为 DeepSeek Harness（简称 DSH）Web UI 增加类似 Codex 的「置顶会话」功能。现在它是一个可安装的 DSH Web UI 插件，不需要直接修改 DSH 官方编译文件。

> 项目名称：DSH Session Pins。`pins` 指“置顶会话”，不是绘画或图片功能。

## 功能

- 在会话原有的三点菜单中加入「置顶会话 / 取消置顶会话」。
- 在工作区会话列表顶部显示带置顶图标的「置顶会话」区块。
- 置顶会话在普通工作区和单列表模式中都显示在前面。
- 优先使用 DSH host 持久化置顶会话 ID，跨浏览器、刷新页面、重启 DSH 和更新 DSH 后仍然保留。
- 首次升级时会把旧版浏览器 `localStorage` 中的置顶列表迁移到 DSH host；浏览器存储只作为兼容缓存。
- 支持多标签页通过浏览器 `storage` 事件同步置顶状态。
- 插件卸载时会移除自身 DOM、样式和监听器，不删除 DSH host 中已经保存的置顶列表。

## 安装

### 从 npm Registry 安装（推荐）

插件发布后，在 PowerShell 或终端执行：

```powershell
dsh plugin --profile web add dsh-session-pins
```

该命令会把 npm 包加入 DSH 的 `web` profile。安装完成后必须重启 `dsh web`，单纯刷新页面不会重新组合 profile。

如果只想把包安装到普通 Node.js 项目中，也可以使用：

```powershell
npm install dsh-session-pins
```

但单独执行 `npm install` 不会自动把插件挂载到 DSH profile；在 DSH 中使用上一条 `dsh plugin` 命令更合适。

### 从 GitHub 本地开发安装

```powershell
git clone https://github.com/JINGMINGRUO/dsh-session-pins.git
cd dsh-session-pins
npm run build
dsh plugin --profile web add link:E:/path/to/dsh-session-pins
```

请将最后一行的路径替换成实际仓库路径。重新构建后重启 `dsh web`。

## 卸载

```powershell
dsh plugin --profile web remove dsh-session-pins
```

卸载后重启 `dsh web`。DSH host 中已经保存的置顶列表不会被插件卸载删除；如果以后重新安装同一插件，仍可读取。浏览器兼容缓存可以在 DSH 页面的开发者控制台清除：

```js
localStorage.removeItem("dsh.workspace.pinnedSessions.v1")
```

## 数据和隐私

置顶会话 ID 保存在 DSH 用户目录下的 `dsh-session-pins.json`，浏览器 `localStorage` 的 `dsh.workspace.pinnedSessions.v1` 只作为兼容缓存和旧数据迁移来源。插件只保存会话 ID，不保存标题、消息或会话内容，不修改 Host 会话账本，也不包含 DSH 官方编译文件。清除浏览器站点数据不会删除 DSH host 中的置顶状态。

## 为什么使用 DOM 扩展

DSH 官方侧边栏的 `sidebar.workspaces` 是单占用槽位，已经由官方 Workspace 插件使用；会话行菜单目前也没有对外开放的菜单项槽位。因此插件采用 DSH 官方支持的客户端插件生命周期，在浏览器端使用隔离的 `data-dsh-session-pins-*` 标记和 `MutationObserver` 扩展现有 DOM：

- 不修改 `@deepseek-ai/dsh-client-ui-workspace/lib/client.js`。
- React 重绘侧边栏后，插件会自动重新挂载置顶区块和菜单项。
- 插件停止或卸载时会恢复被隐藏的普通会话行。
- 会话 ID 来自 DSH 的 `sessions` 客户端运行时；DOM 只负责呈现和交互。

架构细节见 [插件架构说明](docs/PLUGIN-ARCHITECTURE.md)。

## 兼容性和注意事项

插件面向 DSH `0.1.0-rc.8` 的客户端运行时和 Workspace UI。由于官方 UI 的无障碍标签或 DOM 结构可能随版本变化，升级 DSH 后请检查置顶区块和三点菜单。如果插件无法识别某个会话，会保留官方会话列表，不会阻止 DSH 启动。

`legacy-patch/` 中保留旧版手工 bundle 补丁，仅用于已经使用旧方案的用户迁移；新的安装方式不应执行这些脚本。

## 开发与检查

```powershell
npm run check
```

`npm run check` 会重新生成 `lib` 客户端入口，检查源代码、浏览器模块、Host 入口和旧版迁移脚本的 Node.js 语法。

## 许可证

MIT。
