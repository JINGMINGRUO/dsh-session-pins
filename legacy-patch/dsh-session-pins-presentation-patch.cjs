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
const baseMarker = '/* DSH_SESSION_PINS_PATCH v1 */';
const presentationMarker = '/* DSH_SESSION_PINS_PRESENTATION_PATCH v1 */';
const tab = String.fromCharCode(9);
const newline = String.fromCharCode(10);

if (!fs.existsSync(target)) throw new Error('[dsh-session-pins-presentation-patch] target not found: ' + target);
let source = fs.readFileSync(target, 'utf8');
if (!source.includes(baseMarker)) throw new Error('[dsh-session-pins-presentation-patch] base session pin patch is not present');
if (source.includes(presentationMarker)) {
  execFileSync(process.execPath, ['--check', target], { stdio: 'inherit' });
  console.log('[dsh-session-pins-presentation-patch] already applied: ' + target);
  process.exit(0);
}

function replaceOnce(oldText, newText, label) {
  const count = source.split(oldText).length - 1;
  if (count !== 1) throw new Error('[dsh-session-pins-presentation-patch] expected one ' + label + ' anchor, found ' + count);
  source = source.replace(oldText, newText);
}

const persistAnchor = [
  tab.repeat(2) + 'function persistPinnedSessionIds(ids) {',
  tab.repeat(3) + 'if (typeof window === "undefined") return;',
  tab.repeat(3) + 'try {',
  tab.repeat(4) + 'window.localStorage.setItem(DSH_PINNED_SESSIONS_KEY, JSON.stringify(ids));',
  tab.repeat(3) + '} catch {',
  tab.repeat(4) + '/* Private browsing or blocked storage must not break the sidebar. */',
  tab.repeat(3) + '}',
  tab.repeat(2) + '}'
].join(newline);
const presentationHelpers = [
  tab.repeat(2) + 'function PinnedSessionIcon({ size = 16 }) {',
  tab.repeat(3) + 'return (0, react_jsx_runtime.jsx)("svg", {',
  tab.repeat(4) + 'width: size,',
  tab.repeat(4) + 'height: size,',
  tab.repeat(4) + 'viewBox: "0 0 16 16",',
  tab.repeat(4) + 'fill: "none",',
  tab.repeat(4) + '"aria-hidden": "true",',
  tab.repeat(4) + 'children: (0, react_jsx_runtime.jsx)("path", {',
  tab.repeat(5) + 'd: "M5 1.5h6v1.4l-1 1.2v2.3l2.7 2.7v1H8.8v4.4L8 15l-.8-.5V10.1H3.3v-1L6 6.4V4.1L5 2.9V1.5Z",',
  tab.repeat(5) + 'fill: "currentColor"',
  tab.repeat(4) + '})',
  tab.repeat(3) + '});',
  tab.repeat(2) + '}',
  tab.repeat(2) + 'function PinnedSectionHeader({ t }) {',
  tab.repeat(3) + 'return (0, react_jsx_runtime.jsx)("div", {',
  tab.repeat(4) + 'className: Rows_module_css_default.projectRow,',
  tab.repeat(4) + 'role: "treeitem",',
  tab.repeat(4) + 'children: [',
  tab.repeat(5) + '(0, react_jsx_runtime.jsx)("span", {',
  tab.repeat(6) + 'className: Rows_module_css_default.slot,',
  tab.repeat(6) + 'children: (0, react_jsx_runtime.jsx)(PinnedSessionIcon, {})',
  tab.repeat(5) + '}),',
  tab.repeat(5) + '(0, react_jsx_runtime.jsx)("span", {',
  tab.repeat(6) + 'className: Rows_module_css_default.projectText,',
  tab.repeat(6) + 'children: (0, react_jsx_runtime.jsx)("span", {',
  tab.repeat(7) + 'className: Rows_module_css_default.title,',
  tab.repeat(7) + 'children: t("section.pinned")',
  tab.repeat(6) + '})',
  tab.repeat(5) + '})',
  tab.repeat(4) + ']',
  tab.repeat(3) + '});',
  tab.repeat(2) + '}'
].join(newline);
if (!source.includes('function PinnedSessionIcon')) replaceOnce(persistAnchor, persistAnchor + newline + presentationHelpers, 'presentation helper insertion');

const pinMenuOld = [
  tab.repeat(4) + '{',
  tab.repeat(5) + 'id: "pin",',
  tab.repeat(5) + 'label: pinned ? t("menu.unpinSession") : t("menu.pinSession")',
  tab.repeat(4) + '},'
].join(newline);
const pinMenuNew = [
  tab.repeat(4) + '{',
  tab.repeat(5) + 'id: "pin",',
  tab.repeat(5) + 'label: pinned ? t("menu.unpinSession") : t("menu.pinSession"),',
  tab.repeat(5) + 'icon: (0, react_jsx_runtime.jsx)(PinnedSessionIcon, {})',
  tab.repeat(4) + '},'
].join(newline);
if (!source.includes('icon: (0, react_jsx_runtime.jsx)(PinnedSessionIcon, {})')) replaceOnce(pinMenuOld, pinMenuNew, 'pin menu icon');

const handlerNeedle = 'if (id === "pin" && onTogglePin !== void 0) onTogglePin(node.id);';
const lines = source.split(newline);
const handlerIndexes = lines.map((line, index) => line.includes(handlerNeedle) ? index : -1).filter((index) => index !== -1);
if (handlerIndexes.length !== 1) throw new Error('[dsh-session-pins-presentation-patch] expected one pin handler, found ' + handlerIndexes.length);
lines[handlerIndexes[0]] = tab.repeat(9) + handlerNeedle;
source = lines.join(newline);

const sectionOld = [
  '(0, react_jsx_runtime.jsx)("div", {',
  tab.repeat(8) + 'className: WorkspaceBrowser_module_css_default.sectionLabel,',
  tab.repeat(8) + 'children: t("section.pinned")',
  tab.repeat(7) + '})'
].join(newline);
if (!source.includes('children: [(0, react_jsx_runtime.jsx)(PinnedSectionHeader, { t })')) replaceOnce(sectionOld, '(0, react_jsx_runtime.jsx)(PinnedSectionHeader, { t })', 'workspace-style pinned header');

const pinnedSectionStart = source.indexOf('children: [(0, react_jsx_runtime.jsx)(PinnedSectionHeader, { t })');
const pinnedSectionEnd = source.indexOf('}, node.id))]', pinnedSectionStart);
const pinnedFlat = source.indexOf('flat: true,', pinnedSectionStart);
if (pinnedSectionStart !== -1 && pinnedFlat !== -1 && pinnedFlat < pinnedSectionEnd) source = source.slice(0, pinnedFlat) + 'flat: false,' + source.slice(pinnedFlat + 'flat: true,'.length);

source = source.replaceAll('"section.pinned": "固定会话"', '"section.pinned": "置顶会话"');
source = source.replaceAll('"menu.pinSession": "固定会话"', '"menu.pinSession": "置顶会话"');
source = source.replaceAll('"menu.unpinSession": "取消固定会话"', '"menu.unpinSession": "取消置顶会话"');
source = source.replace(baseMarker, baseMarker + newline + tab.repeat(2) + presentationMarker);

const backup = target + '.bak-dsh-session-pins-presentation-' + Date.now();
fs.copyFileSync(target, backup);
fs.writeFileSync(target, source, 'utf8');
try {
  execFileSync(process.execPath, ['--check', target], { stdio: 'inherit' });
} catch (error) {
  fs.copyFileSync(backup, target);
  throw error;
}
console.log('[dsh-session-pins-presentation-patch] patched: ' + target);
console.log('[dsh-session-pins-presentation-patch] backup: ' + backup);
