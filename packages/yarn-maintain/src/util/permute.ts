export function permute<A, B>(arrays: [A[], B[]]): [A, B][]
export function permute<A, B, C>(arrays: [A[], B[], C[]]): [A, B, C][]

export function permute(arrays: unknown[][]): unknown[][] {
  const q = [new Node({ keys: arrays[0], level: 0 })]

  const r = []

  while (q.length) {
    const parent = q.shift() as Node<unknown>
    const { keys, level } = parent

    const nextLevel = level + 1
    const nextKeys = arrays[nextLevel] ?? []

    for (let i = 0; i < keys.length; i++) {
      const nextNode = new Node({
        parent,
        level: nextLevel,
        keys: nextKeys,
        data: keys[i],
      })
      q.push(nextNode)
      if (nextNode.isLeaf) {
        r.push(Array.from(nextNode.path()))
      }
    }
  }

  return r
}

class Node<T> {
  data
  keys
  level
  parent

  constructor({
    data,
    keys,
    level,
    parent,
  }: {
    data?: T
    keys: T[]
    level: number
    parent?: Node<T>
  }) {
    this.data = data
    this.keys = keys
    this.level = level
    this.parent = parent
  }

  *path(): Iterable<T> {
    const { parent, data } = this
    if (parent != null && typeof data !== 'undefined') {
      for (const p of parent.path()) {
        yield p
      }
      yield data
    }
  }

  get isLeaf() {
    return !this.keys.length
  }
}
