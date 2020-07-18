import Base from './Base'
import Game from '../Game'

describe('Base entity class', () => {
  const game = new Game()
  it('instances have a unique id', () => {
    const instance1 = new Base(game, 'grid')
    const instance2 = new Base(game, 'grid')

    expect(instance1.id).not.toBe(instance2.id)
  })
})
