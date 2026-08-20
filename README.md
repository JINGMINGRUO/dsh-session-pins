# DSH Session Pins

[npm 安装页](https://www.npmjs.com/package/dsh-session-pins) · [问题反馈](https://github.com/JINGMINGRUO/dsh-session-pins/issues)

给 DeepSeek Harness（DSH）侧边栏增加“置顶会话”功能。把常用会话放到列表最上方，不会随着原工作区折叠而折叠。

置顶状态保存在 DSH 本机，不依赖某一个浏览器：换浏览器、清除网页缓存、重启 DSH 或更新 DSH 后，置顶会话仍会保留。

## 安装

在 PowerShell 中执行：

```powershell
dsh plugin --profile web add dsh-session-pins
```

然后重启 DSH Web 服务：

```powershell
dsh web
```

重新打开 DSH 页面后即可使用。只刷新网页不足以载入新插件，因此安装或升级后需要重启 `dsh web`。

## 使用方法

1. 在侧边栏找到需要保留在顶部的会话。
2. 点击会话右侧的三个点。
3. 点击“置顶会话”。
4. 该会话会出现在侧边栏顶部的“置顶会话”区域。

需要取消时，在同一位置点击“取消置顶会话”即可。点击置顶区域中的会话，和点击原会话一样，会直接打开该会话。

## 安装后如何确认

安装完成并重启 DSH 后，任意会话的三个点菜单中应出现“置顶会话”。置顶一个会话后：

- 它会显示在侧边栏顶部。
- 折叠它原本所在的工作区后，它仍会留在顶部。
- 关闭浏览器、换一个浏览器或重启 DSH 后，它仍会被置顶。

## 更新

执行下面两条命令，然后重启 `dsh web`：

```powershell
dsh plugin --profile web add dsh-session-pins
dsh web
```

插件会保留你已有的置顶列表。

## 卸载

```powershell
dsh plugin --profile web remove dsh-session-pins
```

卸载后重启 `dsh web`。已保存的置顶列表不会被删除；以后重新安装插件时会自动恢复。

## 常见问题

### 安装后看不到“置顶会话”

先确认已经重启 `dsh web`，再完全关闭并重新打开 DSH 页面。若仍然没有，请在 [GitHub Issues](https://github.com/JINGMINGRUO/dsh-session-pins/issues) 提交问题，并附上 DSH 版本和侧边栏截图。

### 换浏览器后置顶会话会不会消失？

不会。置顶列表保存在 DSH 的本机用户数据中，而不是只保存在浏览器里。

### 清掉浏览器缓存会不会消失？

不会。浏览器缓存只用于兼容和迁移；正式数据由 DSH 保存。

### 可以只用 npm install 吗？

不建议。`npm install dsh-session-pins` 只会把包下载到 Node.js 项目，不会把插件装入 DSH。请使用上面的 `dsh plugin --profile web add dsh-session-pins` 命令。

## 数据与隐私

插件只保存“哪些会话被置顶”的会话 ID，不保存会话标题、消息或会话内容，也不修改 DSH 的会话记录。

## 开发者信息

- [更新记录](CHANGELOG.md)
- [插件架构说明](docs/PLUGIN-ARCHITECTURE.md)
- [社区调研](docs/COMMUNITY-RESEARCH.md)
- [npm 包主页](https://www.npmjs.com/package/dsh-session-pins)

## 许可证

MIT
