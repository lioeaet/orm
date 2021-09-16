import { orm } from '*'
export default () => <div />

const baseOrm = orm(() => ({
  baseChild: childOrm,
  baseBaseArr: [baseOrm]
}), 'base')

const childOrm = orm(() => ({
  childBase: baseOrm,
  childBaseArr: [baseOrm],
  childInner: {
    k: {
      childBaseInner: baseOrm
    }
  }
}), 'child')

const base1_1 = baseOrm.put({
  id: 1,
  baseChild: {
    id: 1
  },
  baseBaseArr: [{ id: 1 }]
})

const child1_3 = childOrm.put({
  id: 1,
  childBase: { id: 1 },
  childBaseArr: [{ id: 1 }, { id: 1 }],
  childInner: {
    k: {
      childBaseInner: {
        id: 1
      }
    }
  }
})

baseOrm.remove(1)

console.log('oki')