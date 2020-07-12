import Base from '../Base'
import { BattleManager } from '../../services'

export default class Game extends Base {
  private battle?: BattleManager

  constructor() {
    super()
  }

  private *loop() {
    while (this.battle) {
      yield
    }
  }
}
