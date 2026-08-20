window.__ModuleLoader__.load({id:"dsh-session-pins",factory:function(require){
"use strict";
/* DSH Web client plugin: pinned sessions without editing the official bundle. */
const name = 'dsh-session-pins'
const inject = ['sessions']

const STORAGE_KEY = 'dsh.workspace.pinnedSessions.v1'
const STYLE_ID = 'dsh-session-pins-style'
const SECTION_ATTR = 'data-dsh-session-pins-section'
const ROW_ATTR = 'data-dsh-session-pins-row'
const SESSION_ATTR = 'data-dsh-session-pins-session-id'
const HIDDEN_ATTR = 'data-dsh-session-pins-hidden'
const MENU_ITEM_ATTR = 'data-dsh-session-pins-menu-item'
const MENU_SESSION_ATTR = 'data-dsh-session-pins-menu-session-id'
const CUSTOM_MENU_ATTR = 'data-dsh-session-pins-custom-menu'
const MARKER_ATTR = 'data-dsh-session-pins'

const PIN_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g transform="translate(-2 -2) scale(1.25)"><path d="m5 2.5 6 6"/><path d="M4.1 5.2 2.8 6.5l2.1 2.1-1.3 3.8 4.1-1.2 2.1 2.1 1.3-1.3"/><path d="m8.2 3.8 2.7-1.1 2.4 2.4-1.1 2.7"/></g></svg>'
const MORE_ICON = '<span aria-hidden="true" style="font-size:17px;line-height:12px">⋯</span>'

const STYLE_TEXT = [
  '[data-dsh-session-pins-section]{margin:2px 0 4px}',
  '[data-dsh-session-pins-header]{display:flex;align-items:center;gap:6px;min-height:34px;padding:0 8px;color:var(--dsw-alias-label-primary,#f9fafb);font-size:14px;font-weight:400;line-height:20px;user-select:none}',
  '[data-dsh-session-pins-header]>[aria-hidden="true"]{display:flex;align-items:center;justify-content:center;flex:none;width:16px;height:20px}',
  '[data-dsh-session-pins-header] svg{display:block;flex:none;width:16px;height:16px}',
  '[data-dsh-session-pins-list]{display:flex;flex-direction:column;gap:1px}',
  '[data-dsh-session-pins-row]{position:relative;display:flex;align-items:center;min-width:0;min-height:32px;margin:0;padding:0 8px;border-radius:8px;color:var(--dsw-alias-label-secondary,#73777f);cursor:pointer;font-size:13px;line-height:32px}',
  '[data-dsh-session-pins-row] > .YDXeBa_slot{display:flex;align-items:center;flex:none;width:16px;height:20px}',
  '[data-dsh-session-pins-row]:hover{background:var(--dsw-specific-sidebar-nav-item-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,#202124)}',
  '[data-dsh-session-pins-row][aria-selected="true"]{background:var(--dsw-specific-sidebar-nav-item-active,rgba(127,127,127,.16));color:var(--dsw-alias-label-primary,#202124)}',
  '[data-dsh-session-pins-row] [data-dsh-session-pins-label]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}',
  '[data-dsh-session-pins-row] [data-dsh-session-pins-action]{display:inline-flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;margin-left:4px;padding:0;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.72}',
  '[data-dsh-session-pins-row] [data-dsh-session-pins-action]:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14));opacity:1}',
  '[data-dsh-session-pins-menu-item]{display:flex!important;align-items:center;gap:8px;box-sizing:border-box}',
  '[data-dsh-session-pins-menu-item] svg{display:block;flex:none;color:var(--dsw-alias-label-tertiary,#adb2b8)}',
  '[data-dsh-session-pins-custom-menu]{position:fixed;z-index:10000;min-width:156px;padding:4px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.28));border-radius:8px;background:var(--dsw-alias-bg-elevated,#fff);box-shadow:0 8px 24px rgba(0,0,0,.18);color:var(--dsw-alias-label-primary,#202124);font-size:13px}',
  '[data-dsh-session-pins-custom-menu] [data-dsh-session-pins-menu-item]{width:100%;min-height:30px;padding:0 9px;border:0;border-radius:6px;background:transparent;color:inherit;text-align:left;cursor:pointer}',
  '[data-dsh-session-pins-custom-menu] [data-dsh-session-pins-menu-item]:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}',
  '[data-dsh-frame][data-sidebar-collapsed] [data-dsh-session-pins-header]{justify-content:center;padding:0}',
  '[data-dsh-frame][data-sidebar-collapsed] [data-dsh-session-pins-header] span{display:none}',
  '[data-dsh-frame][data-sidebar-collapsed] [data-dsh-session-pins-row]{padding-left:8px}',
  '[data-dsh-frame][data-sidebar-collapsed] [data-dsh-session-pins-label]{display:none}',
  '[data-dsh-frame][data-sidebar-collapsed] [data-dsh-session-pins-action]{display:none}'
].join('')

function normalize(value) {
  return String(value || '').replace(/[“”]/g, '"').replace(/[「」]/g, '"').trim().toLocaleLowerCase()
}

function readPinned() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const value = raw === null ? [] : JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter((id) => typeof id === 'string' && id.length > 0 && id.length < 512).slice(0, 500)
  } catch {
    return []
  }
}

function iconElement() {
  const wrapper = document.createElement('span')
  wrapper.setAttribute('aria-hidden', 'true')
  wrapper.innerHTML = PIN_ICON
  return wrapper
}

function labelElement(text) {
  const label = document.createElement('span')
  label.textContent = text
  return label
}

class SessionPinsController {
  constructor(ctx) {
    this.ctx = ctx
    this.pinned = readPinned()
    this.rowById = new Map()
    this.summaryById = new Map()
    this.activeSessionId = undefined
    this.section = undefined
    this.customMenu = undefined
    this.observer = undefined
    this.scheduled = false
    this.stopped = false
    this.onStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        this.pinned = readPinned()
        this.schedule()
      }
    }
    this.onPointerDown = (event) => this.captureSessionAction(event)
  }

  start() {
    document.documentElement?.setAttribute(MARKER_ATTR, 'native-plugin')
    this.installStyle()
    window.addEventListener('storage', this.onStorage)
    document.addEventListener('pointerdown', this.onPointerDown, true)
    const store = this.ctx?.sessions?.list
    if (store && typeof store.subscribe === 'function') {
      const dispose = store.subscribe(() => this.schedule())
      if (typeof dispose === 'function') this.listDisposer = dispose
    }
    const observerTarget = document.body || document.documentElement
    if (observerTarget && typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => this.schedule())
      this.observer.observe(observerTarget, { childList: true, subtree: true })
    }
    this.schedule()
  }

  stop() {
    this.stopped = true
    this.listDisposer?.()
    this.observer?.disconnect()
    window.removeEventListener('storage', this.onStorage)
    document.removeEventListener('pointerdown', this.onPointerDown, true)
    this.closeCustomMenu()
    this.section?.remove()
    document.querySelectorAll('[' + HIDDEN_ATTR + ']').forEach((row) => {
      row.style.removeProperty('display')
      row.removeAttribute(HIDDEN_ATTR)
    })
    document.getElementById(STYLE_ID)?.remove()
    document.documentElement?.removeAttribute(MARKER_ATTR)
  }

  installStyle() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = STYLE_TEXT
    document.head?.append(style)
  }

  getSnapshot() {
    const store = this.ctx?.sessions?.list
    try {
      return store?.getSnapshot?.() || { ids: [], byId: {}, current: undefined }
    } catch {
      return { ids: [], byId: {}, current: undefined }
    }
  }

  getSummaries() {
    const snapshot = this.getSnapshot()
    const ids = Array.isArray(snapshot.ids) ? snapshot.ids : Object.keys(snapshot.byId || {})
    const summaries = []
    this.summaryById.clear()
    for (const id of ids) {
      const summary = snapshot.byId?.[id]
      if (!summary || summary.blank) continue
      const normalized = { ...summary, id: String(summary.id || id) }
      summaries.push(normalized)
      this.summaryById.set(normalized.id, normalized)
    }
    return summaries
  }

  findSidebar() {
    return document.querySelector('[data-pane="sidebar"], [class*="sidebarCol"]')
  }

  findSessionRows() {
    const sidebar = this.findSidebar()
    if (!sidebar) return []
    return Array.from(sidebar.querySelectorAll('[role="treeitem"]')).filter((row) => {
      if (row.closest('[' + SECTION_ATTR + ']')) return false
      return Array.from(row.querySelectorAll('button')).some((button) => this.isSessionActionButton(button))
    })
  }

  findTree(rows) {
    const row = rows[0]
    const ownedTree = row?.closest('[role="tree"]')
    if (ownedTree) return ownedTree
    return this.findSidebar()?.querySelector('[role="tree"]')
  }

  isSessionActionButton(button) {
    const aria = normalize(button.getAttribute('aria-label'))
    return (aria.includes('session') && aria.includes('action')) || (aria.includes('会话') && aria.includes('操作'))
  }

  rowSearchText(row) {
    const action = Array.from(row.querySelectorAll('button')).find((button) => this.isSessionActionButton(button))
    return normalize((action?.getAttribute('aria-label') || '') + ' ' + (row.textContent || ''))
  }

  tagRows(rows, summaries) {
    const knownIds = new Set(summaries.map((summary) => summary.id))
    for (const id of this.rowById.keys()) {
      if (!knownIds.has(id)) this.rowById.delete(id)
    }
    const remaining = new Set(knownIds)
    for (const row of rows) {
      row.removeAttribute(SESSION_ATTR)
      const text = this.rowSearchText(row)
      const candidates = summaries.filter((summary) => {
        if (!remaining.has(summary.id)) return false
        const displayTitle = normalize(summary.displayTitle)
        const title = normalize(summary.title)
        return (displayTitle && text.includes(displayTitle)) || (title && text.includes(title))
      })
      const summary = candidates[0]
      if (!summary) continue
      row.setAttribute(SESSION_ATTR, summary.id)
      this.rowById.set(summary.id, row)
      remaining.delete(summary.id)
    }
  }

  schedule() {
    if (this.stopped || this.scheduled) return
    this.scheduled = true
    const run = () => {
      this.scheduled = false
      if (!this.stopped) this.render()
    }
    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(run)
    else window.setTimeout(run, 0)
  }

  render() {
    const summaries = this.getSummaries()
    const rows = this.findSessionRows()
    this.tagRows(rows, summaries)
    const tree = this.findTree(rows)
    if (!tree) {
      this.section?.remove()
      this.section = undefined
      return
    }
    for (const row of rows) {
      const id = row.getAttribute(SESSION_ATTR)
      if (id && this.pinned.includes(id)) {
        row.setAttribute(HIDDEN_ATTR, '')
        row.style.setProperty('display', 'none', 'important')
      } else if (row.hasAttribute(HIDDEN_ATTR)) {
        row.style.removeProperty('display')
        row.removeAttribute(HIDDEN_ATTR)
      }
    }
    const visibleIds = this.pinned.filter((id) => this.summaryById.has(id))
    if (visibleIds.length === 0) {
      this.section?.remove()
      this.section = undefined
      this.decorateMenus()
      return
    }
    this.renderSection(tree, visibleIds)
    this.decorateMenus()
  }

  renderSection(tree, ids) {
    let section = this.section
    if (!section || section.parentElement !== tree) {
      section?.remove()
      section = document.createElement('div')
      section.setAttribute(SECTION_ATTR, '')
      section.setAttribute('role', 'group')
      const template = tree.querySelector('[class*="groupSection"]')
      if (template?.className) section.className = template.className
      tree.insertBefore(section, tree.firstChild)
      this.section = section
    }
    const currentIds = section.getAttribute('data-dsh-session-pins-rendered') || ''
    if (currentIds !== ids.join('\u001f')) {
      section.replaceChildren()
      const header = document.createElement('div')
      header.setAttribute('data-dsh-session-pins-header', '')
      header.setAttribute('aria-label', '置顶会话')
      header.append(iconElement(), labelElement('置顶会话'))
      section.append(header)
      const list = document.createElement('div')
      list.setAttribute('data-dsh-session-pins-list', '')
      for (const id of ids) {
        const row = this.createPinnedRow(id)
        if (row) list.append(row)
      }
      section.append(list)
      section.setAttribute('data-dsh-session-pins-rendered', ids.join('\u001f'))
    }
    const snapshot = this.getSnapshot()
    section.querySelectorAll('[' + ROW_ATTR + ']').forEach((row) => {
      const id = row.getAttribute(SESSION_ATTR)
      row.setAttribute('aria-selected', String(id === snapshot.current))
    })
  }

  createPinnedRow(id) {
    const source = this.rowById.get(id)
    const summary = this.summaryById.get(id)
    if (!summary) return undefined
    const row = source?.cloneNode(true) || document.createElement('div')
    if (!source) {
      row.className = 'YDXeBa_sessionRow'
      const label = labelElement(summary.displayTitle || summary.title || id)
      label.className = 'YDXeBa_title'
      label.setAttribute('data-dsh-session-pins-label', '')
      const slot = document.createElement('span')
      slot.className = 'YDXeBa_slot'
      slot.setAttribute('aria-hidden', 'true')
      row.append(slot, label)
    }
    row.setAttribute(ROW_ATTR, '')
    row.setAttribute(SESSION_ATTR, id)
    row.setAttribute('role', 'treeitem')
    row.removeAttribute('draggable')
    row.removeAttribute(HIDDEN_ATTR)
    row.style.removeProperty('display')
    row.querySelectorAll('[' + ROW_ATTR + ']').forEach((nested) => nested.removeAttribute(ROW_ATTR))
    row.querySelector('.YDXeBa_title')?.setAttribute('data-dsh-session-pins-label', '')
    const snapshot = this.getSnapshot()
    row.setAttribute('aria-selected', String(id === snapshot.current))
    row.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : undefined
      if (target?.closest('button')) return
      event.preventDefault()
      this.openSession(id)
    })
    const action = Array.from(row.querySelectorAll('button')).find((button) => this.isSessionActionButton(button))
    if (action) {
      action.setAttribute('data-dsh-session-pins-action', '')
      action.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        this.openCustomMenu(action, id)
      })
    } else {
      const fallback = document.createElement('button')
      fallback.type = 'button'
      fallback.setAttribute('data-dsh-session-pins-action', '')
      fallback.setAttribute('aria-label', '会话“' + summary.displayTitle + '”的操作')
      fallback.innerHTML = MORE_ICON
      fallback.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        this.openCustomMenu(fallback, id)
      })
      row.append(fallback)
    }
    return row
  }

  captureSessionAction(event) {
    const target = event.target instanceof Element ? event.target : undefined
    const button = target?.closest('button')
    const row = button?.closest('[role="treeitem"]')
    if (!button || !row || row.closest('[' + SECTION_ATTR + ']')) return
    if (!this.isSessionActionButton(button)) return
    const id = row.getAttribute(SESSION_ATTR)
    if (id) this.activeSessionId = id
  }

  menuSessionId(menu) {
    const known = menu.getAttribute(MENU_SESSION_ATTR)
    if (known && this.summaryById.has(known)) return known
    const labelledBy = menu.getAttribute('aria-labelledby')
    const labelledButton = labelledBy ? document.getElementById(labelledBy) : undefined
    const labelledRow = labelledButton?.closest('[role="treeitem"]')
    const labelledId = labelledRow?.getAttribute(SESSION_ATTR)
    if (labelledId) return labelledId
    const openRow = Array.from(this.rowById.entries()).find(([, row]) => row.matches('[class*="menuOpen"]'))
    return openRow?.[0] || this.activeSessionId
  }

  decorateMenus() {
    const menus = Array.from(document.querySelectorAll('[role="menu"]')).filter((menu) => {
      return !menu.closest('[' + SECTION_ATTR + ']') && !menu.hasAttribute(CUSTOM_MENU_ATTR)
    })
    for (const menu of menus) {
      if (menu.querySelector('[' + MENU_ITEM_ATTR + ']')) continue
      const id = this.menuSessionId(menu)
      if (!id || !this.summaryById.has(id)) continue
      menu.setAttribute(MENU_SESSION_ATTR, id)
      menu.append(this.createMenuItem(menu, id))
    }
  }

  createMenuItem(menu, id) {
    const pinned = this.pinned.includes(id)
    const text = pinned ? '取消置顶会话' : '置顶会话'
    const template = menu.querySelector('[role="menuitem"],button')
    const item = template ? template.cloneNode(true) : document.createElement('button')
    item.setAttribute(MENU_ITEM_ATTR, '')
    item.setAttribute('role', 'menuitem')
    item.setAttribute('aria-label', text)
    item.removeAttribute('disabled')
    item.tabIndex = -1
    item.textContent = ''
    item.append(iconElement(), labelElement(text))
    item.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.toggle(id)
      this.closeOfficialMenu(menu)
    })
    return item
  }

  closeOfficialMenu(menu) {
    if (menu.hasAttribute(CUSTOM_MENU_ATTR)) {
      this.closeCustomMenu()
      return
    }
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    window.setTimeout(() => {
      if (menu.isConnected) menu.querySelector('[' + MENU_ITEM_ATTR + ']')?.remove()
    }, 0)
  }

  openCustomMenu(button, id) {
    this.closeCustomMenu()
    const menu = document.createElement('div')
    menu.setAttribute('role', 'menu')
    menu.setAttribute(CUSTOM_MENU_ATTR, '')
    menu.setAttribute(MENU_SESSION_ATTR, id)
    menu.append(this.createMenuItem(menu, id))
    document.body.append(menu)
    const rect = button.getBoundingClientRect()
    const width = 168
    const left = Math.max(6, Math.min(window.innerWidth - width - 6, rect.right - width))
    const top = Math.min(window.innerHeight - 48, rect.bottom + 4)
    menu.style.left = left + 'px'
    menu.style.top = Math.max(6, top) + 'px'
    const outside = (event) => {
      const target = event.target instanceof Node ? event.target : undefined
      if (target && !menu.contains(target) && target !== button) this.closeCustomMenu()
    }
    window.setTimeout(() => document.addEventListener('pointerdown', outside, true), 0)
    this.customMenu = { menu, outside }
  }

  closeCustomMenu() {
    if (!this.customMenu) return
    document.removeEventListener('pointerdown', this.customMenu.outside, true)
    this.customMenu.menu.remove()
    this.customMenu = undefined
  }

  openSession(id) {
    try {
      this.ctx?.sessions?.open?.(id)
    } catch {
      this.rowById.get(id)?.click()
    }
  }

  toggle(id) {
    const next = new Set(this.pinned)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    this.pinned = Array.from(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pinned))
    } catch {
      // Private browsing or storage policy can reject persistence; the current tab still updates.
    }
    this.schedule()
  }
}

function apply(ctx) {
  ctx.effect(() => {
    const controller = new SessionPinsController(ctx)
    controller.start()
    return () => controller.stop()
  }, 'dsh-session-pins: browser controller')
}
return { name, inject, apply };
}});
