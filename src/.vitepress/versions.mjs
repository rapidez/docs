export const LATEST_VERSION = '5.x'

const VERSION_RE = /^(\d+\.x)\//

export function getVersionFromPath(path) {
  const match = path.match(VERSION_RE)
  return match ? match[1] : null
}

export function isOldVersion(path) {
  const version = getVersionFromPath(path)
  return version !== null && version !== LATEST_VERSION
}
