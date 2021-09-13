import g from '*/global'

export const theEnd = Symbol('theEnd')

export const addRelation = (graph, normId, parentNormId, stack) => {
  if (!graph[normId]) graph[normId] = {}
  if (!parentNormId) return
  let way = graph[normId]

  for (let i = stack.indexOf(parentNormId); i < stack.length; i++) {
    const key = stack[i]
    if (i === stack.length - 1) way[key] = theEnd
    else way = way[key] || (way[key] = {})
  }
}

export const removeRelation = (graph, normId, parentNormId, stack) => {
  if (!parentNormId) return

  let current = graph[normId]
  let graphLevel = current
  let key = parentNormId

  for (let i = stack.indexOf(parentNormId); i < stack.length; i++) {
    current = current[stack[i]]
    if (!current) break
    if (Object.keys(current).length > 1) {
      graphLevel = current
      key = stack[i + 1]
    }
  }
  delete graphLevel[key]
}

export const hasRelation = (graph, normId, parentNormId, stack) => {
  if (!parentNormId || !graph[normId]) return false
  let way = graph[normId]

  for (let i = stack.indexOf(parentNormId); i < stack.length; i++) {
    way = way[stack[i]]
    if (!way) break
  }
  return way === theEnd
}

export const hasAllRelations = (upGraph, gGraph) => {
  if (gGraph === theEnd) return upGraph === theEnd
  if (!upGraph) return false

  for (let key in gGraph)
    if (!hasAllRelations(upGraph[key], gGraph[key]))
      return false
  return true
}
