import g from '*/global'
import { theEnd, clone, clearGlobalAfterRemoving } from '*/utils'
import { put } from '*/api/put'

export const replace = (normId, nextNormId, nextId) => {
  const parents = g.graph[normId]
  const diff = clone(g.items[normId])
  diff.id = nextId

  for (let parentNormId in parents) {
    if (normId === parentNormId) continue
    const parent = g.items[parentNormId]
    const parentOrm = g.ormsByNormId[parentNormId]
    const parentDiff = genParentDiff(parents[parentNormId], parent, normId, diff, parent.id)

    put(parentOrm, parentNormId, parentDiff)
  }

  if (g.childs[normId][normId]) {
    g.graph[nextNormId][nextNormId] = g.graph[normId][normId]
    g.childs[nextNormId][nextNormId] = true
  }

  clearGlobalAfterRemoving(normId)

  return g.items[nextNormId]
}

const genParentDiff = (graphLevel, level, childNormId, childNextItem, id) => {
  if (Array.isArray(level)) {
    const child = g.items[childNormId]
    return level.map(x => x === child ? childNextItem : x)
  }
  const diff = id ? { id } : {}

  for (let key in graphLevel)
    diff[key] = graphLevel[key] === theEnd
      ? childNextItem
      : genParentDiff(graphLevel[key], level[key], childNormId, childNextItem)

  return diff
}
