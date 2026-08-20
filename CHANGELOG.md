# 更新记录

## 0.3.0

- 将置顶列表持久化到 DSH 用户目录的 `dsh-session-pins.json`，跨浏览器、刷新、重启和 DSH 更新保留。
- 保留浏览器 `localStorage` 作为兼容缓存；首次运行时会把旧浏览器置顶数据迁移到 DSH host。
- 新增 host 端 `/api/dsh-session-pins` 路由，使用临时文件加原子重命名写入。

## 0.2.0

- 将会话置顶功能改造成可安装的 DSH Web UI 客户端插件。
- 使用 `cordis.patch.yml` 注册 Web profile，不再要求用户直接修改官方 `client.js`。
- 使用 DSH `sessions` 客户端运行时读取稳定会话 ID。
- 保留三点菜单中的置顶操作、置顶区块、图标和浏览器本地持久化。
- 保留旧版手工补丁到 `legacy-patch/`，用于迁移已有安装。

## 0.1.0

- 初版手工 bundle 补丁。
- 在工作区和单列表视图中显示置顶会话。
