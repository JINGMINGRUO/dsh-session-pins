import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(root, 'src', 'client.js'), 'utf8').trim()
const client = [
  'window.__ModuleLoader__.load({id:"dsh-session-pins",factory:function(require){',
  '"use strict";',
  source,
  'return { name, inject, apply };',
  '}});',
  ''
].join('\n')
fs.mkdirSync(path.join(root, 'lib'), { recursive: true })
fs.writeFileSync(path.join(root, 'lib', 'client.js'), client)
fs.copyFileSync(path.join(root, 'src', 'index.js'), path.join(root, 'lib', 'index.js'))
