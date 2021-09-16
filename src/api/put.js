import g from '*/global'
import {
  normalizeId,
  extractId,
  isOrm,
  isPlainObject,
  notify,
  addRelation,
  hasRelation,
  hasAllRelations,
  removeRelation,
  waySet,
  theEnd
} from '*/utils'

const stack = []
let isUpdateParents = false
let nextItems = {} // { normId: item }
let upGraph = {} // { normId: { parentNormId: [...way]: theEnd } }
let iterationUpdates = {} // { normId: true }

export const put = (orm, normId, diff) => {
  isUpdateParents = false
  nextItems = {}
  upGraph = {}
  iterationUpdates = {}
  mergeItem(orm, normId, diff)

  isUpdateParents = true
  updateParents()
  notify(nextItems)

  return g.items[normId]
}

const mergeItem = (orm, normId, diff, parentNormId) => {
  const item = g.items[normId]
  const nextItem = nextItems[normId] || (nextItems[normId] = {})

  if (hasRelation(upGraph, normId, parentNormId, stack)) return nextItem

  if (parentNormId) {
    addRelation(upGraph, normId, parentNormId, stack)
    addRelation(g.graph, normId, parentNormId, stack)
    waySet(g.childs, parentNormId, normId)(true)
    if (normId === parentNormId && normId !== stack[0]) return nextItem

    if (isUpdateParents) {
      if (item === nextItem) return nextItem
      if (item === diff) return diff
    }
  }
  g.itemsMap.delete(item)
  g.itemsMap.set(nextItem, true)

  if (stack.includes(normId)) return nextItem
  iterationUpdates[normId] = true
  g.ormsByNormId[normId] = orm

  stack.push(normId)
  g.items[normId] = merge(g.descFuncs[orm.name](), item, diff, nextItem, normId)
  stack.pop()

  return nextItem
}

const merge = (desc, inst, diff, nextInst, parentNormId) => {
  if (isOrm(desc)) {
    const id = extractId(diff)
    const prevId = extractId(inst)
    const normId = normalizeId(desc, id)

    if (prevId && id !== prevId) {
      const prevNormId = normalizeId(desc, prevId)
      if (prevNormId && parentNormId)
        removeRelation(g.graph, prevNormId, parentNormId, stack)
      if (!diff) return diff
    }
    return mergeItem(desc, normId, diff, parentNormId)
  }

  if (isPlainObject(diff)) {
    for (let key in diff) {
      const keyDesc = desc && desc[key]
      const keyValue = inst && inst[key]

      stack.push(key)
      nextInst[key] = merge(keyDesc, keyValue, diff[key], genInst(diff[key]), parentNormId)
      stack.pop()
    }
    if (isPlainObject(inst))
      for (let key in inst)
        if (!nextInst.hasOwnProperty(key))
          nextInst[key] = inst[key]

    return nextInst
  }

  if (Array.isArray(diff)) {
    const childOrm = desc[0]
    const prevChilds = g.arrChilds.get(inst) || {}
    const nextChilds = {}

    for (let i = 0; i < diff.length; i++) {
      const childDiff = diff[i]
      const childNormId = normalizeId(childOrm, extractId(childDiff))
      const prevChildPlaces = prevChilds[childNormId] || {}
      const childPlaces = nextChilds[childNormId] || {}

      childPlaces[i] = true
      nextChilds[childNormId] = childPlaces
      stack.push(i)

      if (inst && inst[i] && !prevChildPlaces[i]) {
        const placePrevNormId = normalizeId(childOrm, extractId(inst[i]))
        if (placePrevNormId) removeRelation(g.graph, placePrevNormId, parentNormId, stack)
      }

      nextInst[i] = mergeItem(childOrm, childNormId, childDiff, parentNormId)
      stack.pop()
    }

    if (inst && inst.length > diff.length) {
      for (let i = diff.length; i < inst.length; i++) {
        const childNormId = normalizeId(childOrm, extractId(inst[i]))
        stack.push(i)
        removeRelation(g.graph, childNormId, parentNormId, stack)
        stack.pop(i)
      }
    }
    g.arrChilds.delete(inst)
    g.arrChilds.set(nextInst, nextChilds)

    return nextInst
  }

  return nextInst
}

const updateParents = () => {
  for (let normId in iterationUpdates) {
    const parents = g.graph[normId]
    if (!parents) continue

    for (let parentNormId in parents) {
      if (!upGraph[normId] || !hasAllRelations(upGraph[normId][parentNormId], g.graph[normId][parentNormId])) {
        const parent = g.items[parentNormId]
        const parentOrm = g.ormsByNormId[parentNormId]
        const parentDiff = genParentDiff(g.graph[normId][parentNormId], parent, normId, parent.id)
        iterationUpdates = {}
        mergeItem(parentOrm, parentNormId, parentDiff)
        updateParents()
      }
    }
  }
}

const genParentDiff = (graphLevel, level, childNormId, id) => {
  const diff = Array.isArray(level) ? [...level] : id ? { id } : {}

  for (let key in graphLevel)
    diff[key] = graphLevel[key] === theEnd
      ? g.items[childNormId]
      : genParentDiff(graphLevel[key], level[key], childNormId)

  return diff
}

const genInst = diff => Array.isArray(diff) ? [] : isPlainObject(diff) ? {} : diff