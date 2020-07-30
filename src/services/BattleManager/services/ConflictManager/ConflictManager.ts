type ConflictCalculator = (unitA: Unit, unitB: Unit) => number

export default class ConflictManager {
  aggressor: Unit
  defender: Unit
  constructor(aggressor: Unit, defender: Unit) {
    this.aggressor = aggressor
    this.defender = defender
  }

  calculators = {
    turns: (() => 1) as ConflictCalculator,
    accuracy: (() => 1) as ConflictCalculator,
    damage: (() => 1) as ConflictCalculator,
  }

  readonly process = () => {
    const actions = []
    const turns = {
      aggressor: this.calculators.turns(this.aggressor, this.defender),
      defender: this.calculators.turns(this.defender, this.aggressor),
    }

    while (turns.aggressor > 0) {
      const result = this.processTurn(this.aggressor, this.defender)
      if (result.didHit) {
        this.defender.currentHealth -= result.damageDealt
        actions.push({ actor: this.aggressor, result })
        if (this.defender.currentHealth === 0) {
          turns.aggressor = 0
          turns.defender = 0
        }
      }
      turns.aggressor--
    }

    while (turns.defender > 0) {
      const result = this.processTurn(this.defender, this.aggressor)
      if (result.didHit) {
        this.aggressor.currentHealth -= result.damageDealt
        actions.push({ actor: this.defender, result })
        if (this.aggressor.currentHealth === 0) {
          turns.aggressor = 0
          turns.defender = 0
        }
      }
      turns.defender--
    }

    return actions
  }

  private processTurn = (unitA: Unit, unitB: Unit) => {
    const didHit = this.calculators.accuracy(unitA, unitB) > Math.random()

    let damageDealt = didHit ? this.calculators.damage(unitA, unitB) : 0
    damageDealt =
      damageDealt < unitB.currentHealth ? damageDealt : unitB.currentHealth

    return { didHit, damageDealt }
  }
}
