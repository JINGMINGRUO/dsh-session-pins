# 社区调研记录

## 调研时间

2026-08-19，公开发布本项目之前。

## 调研结论

截至调研时间，暂未发现与本项目功能完全相同的 DSH 插件。现有项目大多关注会话归档、删除恢复、统计或工作区管理；没有公开资料同时显示以下完整功能：从会话三点菜单置顶、在左侧栏单独显示置顶区块、使用浏览器本地存储持久化，并同时支持工作区和单列表两种视图。

## 最接近的项目

- [`dsh-session-manager`](https://github.com/dream12347/dsh-session-manager)：主要提供会话删除与恢复、统计、暂停与继续、日志目录、工作区分组与排序、上下文压缩阈值等功能。
- [`dsh-archive-manager`](https://github.com/MichengAI/dsh-archive-manager)：主要面向归档会话的管理。
- [`@huaanhuang/dsh-client-ui-project-sessions`](https://www.npmjs.com/package/@huaanhuang/dsh-client-ui-project-sessions)：名称与会话管理相关，但公开 NPM 索引没有列出本项目的置顶/取消置顶和置顶区块行为，暂时无法确认存在功能重复。

上述项目与本项目可以互补使用。本项目刻意保持范围单一：只负责会话置顶，不处理删除、归档、统计、暂停或服务端数据管理。

## 说明

“置顶”是本项目统一使用的中文文案；仓库名中的 `pins` 只是英文功能名，含义是“置顶会话”，与绘画、图片或图像生成无关。
