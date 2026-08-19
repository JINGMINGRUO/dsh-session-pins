#!/usr/bin/env node
/**
 * DSH session pinning maintenance patch.
 * This repository patches only the installed compiled workspace bundle;
 * it does not redistribute the upstream bundle.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const targetArg = process.argv[2] || process.env.DSH_WORKSPACE_CLIENT;
if (!targetArg) {
  console.error('Usage: node ' + path.basename(process.argv[1]) + ' <path-to-client.js>');
  process.exit(2);
}
const target = path.resolve(targetArg);
const marker = '/* DSH_SESSION_PINS_PATCH v1 */';
const tab = String.fromCharCode(9);
const newline = String.fromCharCode(10);

if (!fs.existsSync(target)) {
  console.error('[dsh-session-pins-patch] target not found: ' + target);
  process.exit(1);
}

let source = fs.readFileSync(target, 'utf8');
if (source.includes(marker)) {
  execFileSync(process.execPath, ['--check', target], { stdio: 'inherit' });
  console.log('[dsh-session-pins-patch] already applied: ' + target);
  process.exit(0);
}

function replaceOnce(oldText, newText, label) {
  const count = source.split(oldText).length - 1;
  if (count !== 1) throw new Error('[dsh-session-pins-patch] expected one ' + label + ' anchor, found ' + count);
  source = source.replace(oldText, newText);
}

const storageAnchor = tab + tab + 'const FLAT_SESSION_ORDER_KEY = "__flat_session_order__";';
const storagePatch = [
  storageAnchor,
  tab + tab + marker,
  tab + tab + 'const DSH_PINNED_SESSIONS_KEY = "dsh.workspace.pinnedSessions.v1";',
  tab + tab + 'function readPinnedSessionIds() {',
  tab + tab + tab + 'if (typeof window === "undefined") return [];',
  tab + tab + tab + 'try {',
  tab + tab + tab + tab + 'const raw = window.localStorage.getItem(DSH_PINNED_SESSIONS_KEY);',
  tab + tab + tab + tab + 'const parsed = raw === null ? [] : JSON.parse(raw);',
  tab + tab + tab + tab + 'if (!Array.isArray(parsed)) return [];',
  tab + tab + tab + tab + 'return [...new Set(parsed.filter((id) => typeof id === "string" && id !== ""))];',
  tab + tab + tab + '} catch {',
  tab + tab + tab + tab + 'return [];',
  tab + tab + tab + '}',
  tab + tab + '}',
  tab + tab + 'function persistPinnedSessionIds(ids) {',
  tab + tab + tab + 'if (typeof window === "undefined") return;',
  tab + tab + tab + 'try {',
  tab + tab + tab + tab + 'window.localStorage.setItem(DSH_PINNED_SESSIONS_KEY, JSON.stringify(ids));',
  tab + tab + tab + '} catch {',
  tab + tab + tab + tab + '/* Private browsing or blocked storage must not break the sidebar. */',
  tab + tab + tab + '}',
  tab + tab + '}'
].join(newline);
replaceOnce(storageAnchor, storagePatch, 'pinned-session storage');

replaceOnce(
  tab + tab + 'function SessionNodeItem({ node, currentId, now, onOpen, onRename, onFork, onArchive, drag, flat = false, t }) {',
  tab + tab + 'function SessionNodeItem({ node, currentId, now, onOpen, onRename, onFork, onArchive, drag, flat = false, pinned = false, onTogglePin, t }) {',
  'SessionNodeItem props'
);

replaceOnce(
  [tab + tab + tab + tab + '},', tab + tab + tab + tab + '{', tab + tab + tab + tab + tab + 'id: "fork",'].join(newline),
  [tab + tab + tab + tab + '},', tab + tab + tab + tab + '{', tab + tab + tab + tab + tab + 'id: "pin",', tab + tab + tab + tab + tab + 'label: pinned ? t("menu.unpinSession") : t("menu.pinSession")', tab + tab + tab + tab + '},', tab + tab + tab + tab + '{', tab + tab + tab + tab + tab + 'id: "fork",'].join(newline),
  'session pin menu item'
);

replaceOnce(
  tab + tab + tab + tab + tab + tab + 'if (id === "rename") onRename(node.id, row.title);',
  tab + tab + tab + tab + tab + tab + 'if (id === "rename") onRename(node.id, row.title);' + newline + tab + tab + tab + tab + tab + tab + 'if (id === "pin" && onTogglePin !== void 0) onTogglePin(node.id);',
  'session pin menu handler'
);

replaceOnce(
  tab + tab + 'function SessionTree({ useSessions, startSession, open, forkSession, workspaces, archivedSessionIds, onRenameRequest, onDeleteRequest, onSessionRename, onSessionArchive, insertWorkspaceBefore, insertSessionBefore, orderBy, groupExpansion, setGroupExpanded, sessionOrderByAccount, sessionUpdatedAtByAccount, syncSessionOrderAccount, setSessionOrder, t }) {',
  tab + tab + 'function SessionTree({ useSessions, startSession, open, forkSession, workspaces, archivedSessionIds, onRenameRequest, onDeleteRequest, onSessionRename, onSessionArchive, insertWorkspaceBefore, insertSessionBefore, orderBy, groupExpansion, setGroupExpanded, sessionOrderByAccount, sessionUpdatedAtByAccount, syncSessionOrderAccount, setSessionOrder, pinnedSessionIds, onTogglePin, t }) {',
  'SessionTree props'
);

const groupsStart = source.indexOf(tab + tab + tab + 'const groups = (0, react.useMemo)(() => deriveGroups(list, orderedWorkspaces, archivedSessionIds, {');
const groupsEnd = source.indexOf(newline + tab + tab + tab + 'const now = Date.now();', groupsStart);
if (groupsStart === -1 || groupsEnd === -1) throw new Error('[dsh-session-pins-patch] session tree groups anchor not found');
const groupsBlock = [
  tab + tab + tab + 'const groups = (0, react.useMemo)(() => deriveGroups(list, orderedWorkspaces, archivedSessionIds, {',
  tab + tab + tab + tab + 'expandedGroups,',
  tab + tab + tab + tab + '...sessionOrderByAccount[""] === void 0 ? {} : { ungroupedOrder: sessionOrderByAccount[""] }',
  tab + tab + tab + '}).map((group) => ({',
  tab + tab + tab + tab + '...group,',
  tab + tab + tab + tab + 'sessions: group.sessions.filter((session) => !pinnedSessionIds.includes(session.id))',
  tab + tab + tab + '})), [',
  tab + tab + tab + tab + 'list,',
  tab + tab + tab + tab + 'orderedWorkspaces,',
  tab + tab + tab + tab + 'archivedSessionIds,',
  tab + tab + tab + tab + 'expandedGroups,',
  tab + tab + tab + tab + 'sessionOrderByAccount,',
  tab + tab + tab + tab + 'pinnedSessionIds',
  tab + tab + tab + ']);',
  tab + tab + tab + 'const pinnedSessions = (0, react.useMemo)(() => {',
  tab + tab + tab + tab + 'const archived = new Set(archivedSessionIds);',
  tab + tab + tab + tab + 'const descendants = (0, _deepseek_ai_dsh_client_runtime_client.indexSubagentDescendants)(list.byId);',
  tab + tab + tab + tab + 'return pinnedSessionIds.map((id) => list.byId[id]).filter((session) => session !== void 0 && !session.blank && sessionVisible(session, list.current, archived)).map((session) => sessionNode(session, descendants));',
  tab + tab + tab + '}, [list, pinnedSessionIds, archivedSessionIds]);'
].join(newline);
source = source.slice(0, groupsStart) + groupsBlock + source.slice(groupsEnd);

const treeChildrenOld = [
  tab + tab + tab + tab + tab + tab + 'children: [groups.length === 0 && (0, react_jsx_runtime.jsx)("div", {',
  tab + tab + tab + tab + tab + tab + tab + 'className: WorkspaceBrowser_module_css_default.empty,',
  tab + tab + tab + tab + tab + tab + tab + 'children: t("empty.none")',
  tab + tab + tab + tab + tab + tab + '}), groups.map((group) => {'
].join(newline);
const treeChildrenNew = [
  tab + tab + tab + tab + tab + 'children: [',
  tab + tab + tab + tab + tab + tab + 'pinnedSessions.length > 0 && (0, react_jsx_runtime.jsxs)("div", {',
  tab + tab + tab + tab + tab + tab + tab + 'className: WorkspaceBrowser_module_css_default.groupSection,',
  tab + tab + tab + tab + tab + tab + tab + 'children: [(0, react_jsx_runtime.jsx)("div", {',
  tab + tab + tab + tab + tab + tab + tab + tab + 'className: WorkspaceBrowser_module_css_default.sectionLabel,',
  tab + tab + tab + tab + tab + tab + tab + tab + 'children: t("section.pinned")',
  tab + tab + tab + tab + tab + tab + tab + '}), pinnedSessions.map((node) => (0, react_jsx_runtime.jsx)(SessionNodeItem, {',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'node,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'currentId: current,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'now,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'onOpen: open,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'onRename: onSessionRename,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'onFork: forkSession,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'onArchive: onSessionArchive,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'flat: true,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'pinned: true,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 'onTogglePin,',
  tab + tab + tab + tab + tab + tab + tab + tab + tab + 't',
  tab + tab + tab + tab + tab + tab + tab + tab + '}, node.id))]',
  tab + tab + tab + tab + tab + tab + '}),',
  tab + tab + tab + tab + tab + 'groups.length === 0 && pinnedSessions.length === 0 && (0, react_jsx_runtime.jsx)("div", {',
  tab + tab + tab + tab + tab + tab + 'className: WorkspaceBrowser_module_css_default.empty,',
  tab + tab + tab + tab + tab + tab + 'children: t("empty.none")',
  tab + tab + tab + tab + tab + '}), groups.map((group) => {'
].join(newline);
replaceOnce(treeChildrenOld, treeChildrenNew, 'pinned tree section');

const treeArchiveLine = tab + tab + tab + tab + tab + tab + tab + tab + tab + tab + tab + 'onArchive: onSessionArchive,' + newline;
const treeArchiveReplacement = treeArchiveLine + tab + tab + tab + tab + tab + tab + tab + tab + tab + tab + tab + 'onTogglePin,' + newline;
const treeArchiveCount = source.split(treeArchiveLine).length - 1;
if (treeArchiveCount !== 1) throw new Error('[dsh-session-pins-patch] expected one tree session archive prop, found ' + treeArchiveCount);
source = source.replace(treeArchiveLine, treeArchiveReplacement);
const flatStart = source.indexOf(tab + tab + 'function FlatList');
const flatArchiveLine = tab + tab + tab + tab + tab + tab + tab + 'onArchive: onSessionArchive,' + newline;
const flatArchiveReplacement = flatArchiveLine + tab + tab + tab + tab + tab + tab + tab + 'onTogglePin,' + newline;
const flatArchiveIndex = source.indexOf(flatArchiveLine, flatStart);
if (flatStart === -1 || flatArchiveIndex === -1) throw new Error('[dsh-session-pins-patch] flat session archive prop not found');
source = source.slice(0, flatArchiveIndex) + flatArchiveReplacement + source.slice(flatArchiveIndex + flatArchiveLine.length);

replaceOnce(
  tab + tab + 'function FlatList({ useSessions, open, forkSession, onSessionRename, onSessionArchive, archivedSessionIds, orderBy, sessionOrderByAccount, sessionUpdatedAtByAccount, syncSessionOrderAccount, setSessionOrder, t }) {',
  tab + tab + 'function FlatList({ useSessions, open, forkSession, onSessionRename, onSessionArchive, archivedSessionIds, pinnedSessionIds, onTogglePin, orderBy, sessionOrderByAccount, sessionUpdatedAtByAccount, syncSessionOrderAccount, setSessionOrder, t }) {',
  'FlatList props'
);

const flatRowsOld = [
  tab + tab + tab + 'const rows = (0, react.useMemo)(() => {',
  tab + tab + tab + tab + 'const byId = new Map(baseRows.map((row) => [row.id, row]));',
  tab + tab + tab + tab + 'return reconciledSessionOrder(sessionIds, sessionOrderByAccount[FLAT_SESSION_ORDER_KEY]).flatMap((id) => {',
  tab + tab + tab + tab + tab + 'const row = byId.get(id);',
  tab + tab + tab + tab + tab + 'return row === void 0 ? [] : [row];',
  tab + tab + tab + tab + '});',
  tab + tab + tab + '}, [',
  tab + tab + tab + tab + 'baseRows,',
  tab + tab + tab + tab + 'sessionOrderByAccount,',
  tab + tab + tab + tab + 'sessionIds',
  tab + tab + tab + ']);'
].join(newline);
const flatRowsNew = [
  tab + tab + tab + 'const rows = (0, react.useMemo)(() => {',
  tab + tab + tab + tab + 'const byId = new Map(baseRows.map((row) => [row.id, row]));',
  tab + tab + tab + tab + 'const orderedRows = reconciledSessionOrder(sessionIds, sessionOrderByAccount[FLAT_SESSION_ORDER_KEY]).flatMap((id) => {',
  tab + tab + tab + tab + tab + 'const row = byId.get(id);',
  tab + tab + tab + tab + tab + 'return row === void 0 ? [] : [row];',
  tab + tab + tab + tab + '});',
  tab + tab + tab + tab + 'const pinned = new Set(pinnedSessionIds);',
  tab + tab + tab + tab + 'const pinnedRows = pinnedSessionIds.map((id) => byId.get(id)).filter((row) => row !== void 0);',
  tab + tab + tab + tab + 'return [...pinnedRows, ...orderedRows.filter((row) => !pinned.has(row.id))];',
  tab + tab + tab + '}, [',
  tab + tab + tab + tab + 'baseRows,',
  tab + tab + tab + tab + 'sessionOrderByAccount,',
  tab + tab + tab + tab + 'sessionIds,',
  tab + tab + tab + tab + 'pinnedSessionIds',
  tab + tab + tab + ']);'
].join(newline);
replaceOnce(flatRowsOld, flatRowsNew, 'flat pinned ordering');

const flatRowMarker = [tab + tab + tab + tab + tab + tab + tab + 'onTogglePin,', tab + tab + tab + tab + tab + tab + tab + 'flat: true,'].join(newline);
const flatRowIndex = source.indexOf(flatRowMarker, flatStart);
if (flatRowIndex === -1) throw new Error('[dsh-session-pins-patch] flat row pin marker not found');
source = source.slice(0, flatRowIndex) + tab + tab + tab + tab + tab + tab + 'onTogglePin,' + newline + tab + tab + tab + tab + tab + tab + 'pinned: pinnedSessionIds.includes(node.id),' + newline + tab + tab + tab + tab + tab + tab + 'flat: true,' + source.slice(flatRowIndex + flatRowMarker.length);

const queryAnchor = tab + tab + tab + 'const [query, setQuery] = (0, react.useState)("");';
replaceOnce(queryAnchor, [
  queryAnchor,
  tab + tab + tab + 'const [pinnedSessionIds, setPinnedSessionIds] = (0, react.useState)(() => readPinnedSessionIds());',
  tab + tab + tab + 'const togglePinnedSession = (0, react.useCallback)((sessionId) => {',
  tab + tab + tab + tab + 'setPinnedSessionIds((current) => {',
  tab + tab + tab + tab + tab + 'const next = current.includes(sessionId) ? current.filter((id) => id !== sessionId) : [sessionId, ...current];',
  tab + tab + tab + tab + tab + 'persistPinnedSessionIds(next);',
  tab + tab + tab + tab + tab + 'return next;',
  tab + tab + tab + tab + '});',
  tab + tab + tab + '}, []);'
].join(newline), 'WorkspaceBrowser pinned state');

const flatPass = [tab + tab + tab + tab + tab + tab + tab + 'archivedSessionIds,', tab + tab + tab + tab + tab + tab + tab + 'orderBy,'].join(newline);
replaceOnce(flatPass, [tab + tab + tab + tab + tab + tab + tab + 'archivedSessionIds,', tab + tab + tab + tab + tab + tab + tab + 'pinnedSessionIds,', tab + tab + tab + tab + tab + tab + 'onTogglePin: togglePinnedSession,', tab + tab + tab + tab + tab + tab + tab + 'orderBy,'].join(newline), 'FlatList pinned props');

const treePass = [tab + tab + tab + tab + tab + tab + tab + 'archivedSessionIds,', tab + tab + tab + tab + tab + tab + tab + 'startSession,'].join(newline);
replaceOnce(treePass, [tab + tab + tab + tab + tab + tab + tab + 'archivedSessionIds,', tab + tab + tab + tab + tab + tab + tab + 'pinnedSessionIds,', tab + tab + tab + tab + tab + tab + tab + 'onTogglePin: togglePinnedSession,', tab + tab + tab + tab + tab + tab + tab + 'startSession,'].join(newline), 'SessionTree pinned props');

replaceOnce(tab + tab + tab + '"section.sessions": "会话",', tab + tab + tab + '"section.sessions": "会话",' + newline + tab + tab + tab + '"section.pinned": "固定会话",', 'Chinese pinned section label');
replaceOnce(tab + tab + tab + '"menu.archiveSession": "归档会话",', tab + tab + tab + '"menu.archiveSession": "归档会话",' + newline + tab + tab + tab + '"menu.pinSession": "固定会话",' + newline + tab + tab + tab + '"menu.unpinSession": "取消固定会话",', 'Chinese pinned menu labels');
replaceOnce(tab + tab + tab + '"section.sessions": "Sessions",', tab + tab + tab + '"section.sessions": "Sessions",' + newline + tab + tab + tab + '"section.pinned": "Pinned sessions",', 'English pinned section label');
replaceOnce(tab + tab + tab + '"menu.archiveSession": "Archive session",', tab + tab + tab + '"menu.archiveSession": "Archive session",' + newline + tab + tab + tab + '"menu.pinSession": "Pin session",' + newline + tab + tab + tab + '"menu.unpinSession": "Unpin session",', 'English pinned menu labels');

const backup = target + '.bak-dsh-session-pins-' + Date.now();
fs.copyFileSync(target, backup);
fs.writeFileSync(target, source, 'utf8');
try {
  execFileSync(process.execPath, ['--check', target], { stdio: 'inherit' });
} catch (error) {
  fs.copyFileSync(backup, target);
  throw error;
}
console.log('[dsh-session-pins-patch] patched: ' + target);
console.log('[dsh-session-pins-patch] backup: ' + backup);
