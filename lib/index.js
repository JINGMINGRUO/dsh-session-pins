import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const ROUTE_PATH = '/api/dsh-session-pins'
const STORAGE_VERSION = 1
const MAX_BODY_BYTES = 64 * 1024
const MAX_PINNED = 500
const MAX_ID_LENGTH = 512

let writeQueue = Promise.resolve()

function storageFile() {
  const configured = String(process.env.DSH_HOME || '').trim()
  const root = configured || join(homedir(), '.dsh')
  return join(resolve(root), 'dsh-session-pins.json')
}

function normalizePinned(value) {
  const list = Array.isArray(value) ? value : []
  return [...new Set(list.filter((id) => typeof id === 'string' && id.length > 0 && id.length < MAX_ID_LENGTH))].slice(0, MAX_PINNED)
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body)
  })
  res.end(body)
}

function requestBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    let size = 0
    let settled = false
    req.on('data', (chunk) => {
      if (settled) return
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        settled = true
        const error = new Error('request body too large')
        error.statusCode = 413
        reject(error)
        req.resume()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (settled) return
      settled = true
      resolveBody(Buffer.concat(chunks).toString('utf8'))
    })
    req.on('error', (error) => {
      if (settled) return
      settled = true
      reject(error)
    })
  })
}

async function readStore() {
  try {
    const parsed = JSON.parse(await readFile(storageFile(), 'utf8'))
    return { exists: true, pinned: normalizePinned(parsed?.pinned) }
  } catch (error) {
    if (error?.code === 'ENOENT') return { exists: false, pinned: [] }
    throw error
  }
}

async function writeStore(pinned) {
  const file = storageFile()
  await mkdir(dirname(file), { recursive: true })
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`
  try {
    await writeFile(temporary, JSON.stringify({ version: STORAGE_VERSION, pinned }) + '\n', 'utf8')
    await rename(temporary, file)
  } catch (error) {
    await unlink(temporary).catch(() => {})
    throw error
  }
}

function enqueueWrite(pinned) {
  const result = writeQueue.then(() => writeStore(pinned))
  writeQueue = result.catch(() => {})
  return result
}

export const inject = ['webServer']

export function apply(ctx) {
  const handler = async (req, res) => {
    try {
      if (req.method === 'GET') {
        sendJson(res, 200, await readStore())
        return
      }
      if (req.method === 'PUT') {
        const body = JSON.parse(await requestBody(req) || '{}')
        if (!Array.isArray(body.pinned)) {
          const error = new Error('pinned must be an array')
          error.statusCode = 400
          throw error
        }
        const pinned = normalizePinned(body.pinned)
        await enqueueWrite(pinned)
        sendJson(res, 200, { exists: true, version: STORAGE_VERSION, pinned })
        return
      }
      sendJson(res, 405, { error: 'method not allowed' })
    } catch (error) {
      ctx.logger.warn(error)
      sendJson(res, Number.isInteger(error?.statusCode) ? error.statusCode : 500, { error: 'storage unavailable' })
    }
  }
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: ROUTE_PATH, handler }), 'dsh-session-pins: durable storage route')
}
