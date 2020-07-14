import Base from './Base'
import { isMainThread } from 'worker_threads'

describe('Base entity class', () => {
  it('instances have a unique id', () => {
    const instance1 = new Base()
    const instance2 = new Base()

    expect(instance1.id).not.toBe(instance2.id)
  })
})
