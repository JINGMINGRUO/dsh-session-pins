# DSH 会话置顶

为 DeepSeek Harness（简称 DSH）Web UI 增加类似 Codex 的「置顶会话」功能。

> 项目名称：DSH Session Pins。这里的 pins 指“置顶”，不是绘画或图片功能。

## 功能

- 在每个会话原有的三点菜单中加入「置顶会话 / 取消置顶会话」。
- 菜单中显示置顶图标，左侧栏顶部显示带置顶图标的「置顶会话」区块。
- 使用浏览器本地存储记住置顶状态，刷新页面后仍然保留。
- 置顶会话显示在普通工作区之前。
- “单列表”模式下，置顶会话同样排在最前面。
- 补丁脚本幂等运行，修改前自动备份，修改后执行 Node.js 语法检查。

本项目不会替换 DSH、启动额外服务器、收集用户数据，也不会重新分发 DSH 官方编译文件。

## 安装与使用

### 通过 npm 安装

发布到 npm 后，可以先安装补丁脚本：

```powershell
npm install dsh-session-pins
```

然后执行两个补丁（顺序不能反）：

```powershell
node node_modules/dsh-session-pins/patch/dsh-session-pins-patch.cjs "C:\path\to\dsh-client-ui-workspace\lib\client.js"
node node_modules/dsh-session-pins/patch/dsh-session-pins-presentation-patch.cjs "C:\path\to\dsh-client-ui-workspace\lib\client.js"
```

- npm 包只包含补丁脚本和说明文档，不包含 DSH 官方编译文件。
- 补丁不会自动执行，必须明确传入目标 `client.js` 路径。

### 环境要求

- 已安装 DeepSeek Harness Web UI。
- Node.js 18 或更高版本。
- 能够找到官方 `@deepseek-ai/dsh-client-ui-workspace` 包中的 `lib/client.js`。

### 执行补丁

请把下面命令中的路径替换成你自己电脑上的实际路径。先执行基础功能补丁，再执行界面文案和图标补丁：

```powershell
node patch/dsh-session-pins-patch.cjs "C:\path\to\dsh-client-ui-workspace\lib\client.js"
node patch/dsh-session-pins-presentation-patch.cjs "C:\path\to\dsh-client-ui-workspace\lib\client.js"
```

执行后重启 DSH Web，再刷新浏览器页面。默认地址通常是 `http://127.0.0.1:23188`。

每次 DSH 或 workspace UI 包升级后，官方编译文件可能被覆盖，需要重新执行这两个补丁。脚本会在目标文件旁生成带时间戳的 `.bak-dsh-session-pins-*` 备份；如果语法检查失败，会自动恢复备份。

## 数据和隐私

置顶会话 ID 保存在当前浏览器的 localStorage 中，使用的键名是 `dsh.workspace.pinnedSessions.v1`。项目不会上传置顶列表，也不会修改 DSH 服务端账本。清除浏览器站点数据会清空置顶状态。

## 兼容性与注意事项

本项目使用文本锚点修改 DSH 的编译后 JavaScript 文件。当前已在 DSH `0.1.0-rc.6` 和官方 `@deepseek-ai/dsh-client-ui-workspace` 编译包上验证。由于上游版本可能调整代码结构，如果脚本提示找不到锚点，请先检查新文件，不要强行替换。

## 开发与检查

在仓库根目录执行：

```bash
npm run check
```

该命令只检查两个补丁脚本的 Node.js 语法，不会修改 DSH 安装目录。

## 社区调研

发布前已检查相关 DSH 会话管理项目，详见 [社区调研记录](docs/COMMUNITY-RESEARCH.md)。

## 更新记录

详见 [CHANGELOG](CHANGELOG.md)。

## 许可证

MIT。
