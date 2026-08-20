# 插件架构说明

## 组成

- `src/client.js`：浏览器端插件源代码。
- `lib/client.js`：由 `build.mjs` 生成的 DSH 浏览器模块，使用 `window.__ModuleLoader__` 注册。
- `src/index.js` / `lib/index.js`：Host 端持久化路由，将置顶列表写入 DSH 用户目录。
- `package.json`：声明 `dsh.client` 依赖和 Web profile bundle patch。
- `cordis.patch.yml`：将 `ui-session-pins` 插入 Web profile 的插件名录。

## 生命周期

DSH 加载客户端插件后，`apply(ctx)` 通过 Cordis 的 `ctx.effect` 创建控制器。控制器订阅 `ctx.sessions.list`，读取会话 ID、标题和当前选中项；同时监听侧边栏 DOM 和浏览器 `storage` 事件。插件卸载时会执行 disposer，移除监听器、样式、置顶区块和临时隐藏标记。

## 置顶操作

1. 捕获官方会话行三点按钮的 `aria-label`，将其与 `sessions.list` 中的会话标题匹配。
2. 官方菜单打开后，插件复制一个官方菜单项的样式结构，追加「置顶会话」或「取消置顶会话」。
3. 操作更新 DSH host 的 `/api/dsh-session-pins`；浏览器 `dsh.workspace.pinnedSessions.v1` 作为兼容缓存，再由同一浏览器标签页和其他同源标签页重新渲染。
4. 置顶区块复制官方会话行的视觉结构；原列表中的对应行暂时隐藏，从而表现为“移动到顶部”而不是重复显示。
5. 置顶行点击仍通过 `ctx.sessions.open(id)` 打开原会话；置顶行的三点按钮使用插件自己的轻量菜单。

## 失效保护

插件只在能够同时得到会话摘要和官方会话操作按钮时标记一个会话。如果上游 UI 标签改变，无法匹配的行不会被隐藏，也不会被复制到置顶区块。MutationObserver 只观察子树变动，不改写官方 React 状态。

## 持久化

Host 端把置顶列表保存到 DSH 用户目录下的 `dsh-session-pins.json`。写入使用临时文件加原子重命名，避免浏览器切换、站点数据清理或 DSH 更新造成列表丢失。第一次连接到没有持久化文件的 host 时，会把旧浏览器缓存迁移到 host；如果 host 已有数据，则以 host 数据为准。

## 限制

当前 DSH 没有公开“会话行菜单项”或“Workspace 列表前置区块”的独立 slot，因此本插件的 UI 适配层依赖官方无障碍角色、按钮标签和侧边栏布局标记。若未来 DSH 提供正式 slot，可将 DOM 适配层替换为 slot 注册，而不需要改变 host 持久化数据。
