export function patchObjectFunctionCalls<
  F extends { [key: string]: (...args: any[]) => any }
>(obj: F, { pre = () => {}, post = () => {} } = {}) {
  const result = {} as { [key: string]: (...args: any[]) => any }
  for (const prop in obj) {
    result[prop] = (...args: any[]) => {
      pre()
      const val = obj[prop](...args)
      post()
      return val
    }
  }
  return result as F
}
