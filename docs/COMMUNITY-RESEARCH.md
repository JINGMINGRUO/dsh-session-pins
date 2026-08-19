# Community research

Checked on 2026-08-19 before publishing this repository.

The closest public DSH projects are complementary rather than duplicates:

- [dsh-session-manager](https://github.com/dream12347/dsh-session-manager) focuses on deletion/recovery, statistics, pause/resume, logs, workspace grouping/sorting, and context compaction.
- [dsh-archive-manager](https://github.com/MichengAI/dsh-archive-manager) focuses on archived-session management.
- [@huaanhuang/dsh-client-ui-project-sessions](https://www.npmjs.com/package/@huaanhuang/dsh-client-ui-project-sessions) is a related package name, but its public index did not expose the pin/unpin and pinned-section behavior implemented here.

This project is intentionally scoped to one feature: pinning sessions from the existing row menu, keeping the IDs local to the browser, and placing those sessions first in both workspace and flat views.
