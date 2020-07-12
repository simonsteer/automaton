export function watch<Publisher extends {}, Prop extends keyof Publisher>(
  obj: Publisher,
  propToWatch: Prop,
  onChange: (value: Publisher[Prop]) => void
) {
  return new Proxy(obj, {
    set: function (target, key, value) {
      const success = Reflect.set(target, key, value)
      if (success && key === propToWatch) {
        onChange(value)
      }
      return success
    },
  })
}

export function tether<Publisher extends {}>(
  obj: Publisher,
  onPropListChange: (propList: (keyof Publisher)[]) => void
) {
  const tetheredMap: { [key in keyof Publisher]?: true } = {}
  const tethered: (keyof Publisher)[] = []

  const get: ProxyHandler<Publisher>['get'] = function (
    target,
    key: keyof Publisher
  ) {
    const success = Reflect.get(target, key)
    if (success && !tetheredMap[key]) {
      tetheredMap[key] = true
      result.tethered = result.tethered.concat(key)
    }
    return success
  }

  const result = watch(
    {
      proxy: new Proxy(obj, { get }),
      tethered,
    },
    'tethered',
    onPropListChange
  )

  return result.proxy
}

export function mapGraph<T, R>(
  graph: T[][],
  callback: (item: T, coordinates: RawCoords) => R
) {
  return graph.map((row, y) => row.map((item, x) => callback(item, { x, y })))
}

export function range(start: number, end: number) {
  return Array(end + 1)
    .fill(0)
    .map((_, i) => i)
    .slice(start)
}
