import Base from './Base'
import Game from '../Game'
import { isMainThread } from 'worker_threads'

describe('Base entity class', () => {
  const game = new Game()
  it('instances have a unique id', () => {
    const instance1 = new Base(game)
    const instance2 = new Base(game)

    expect(instance1.id).not.toBe(instance2.id)
  })
})
