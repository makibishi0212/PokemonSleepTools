import { useState } from 'react'
import LevelUpPlanCard from '../components/LevelUpPlanCard.tsx'
import LevelUpPlanSummary from '../components/LevelUpPlanSummary.tsx'
import ToolPage from '../components/ToolPage.tsx'
import { findPokemon, pokemons } from '../data/pokemons.ts'
import { tools } from '../routes.ts'
import { type Boost, boosts, calcByCandy, calcByTargetLevel } from '../util/levelUp.ts'
import { type Plan, type PlanResult, validatePlan } from '../util/plan.ts'

let nextId = 1

function newPlan(): Plan {
  return {
    id: nextId++,
    pokemonName: pokemons[0].name,
    nature: 'neutral',
    currentLevel: '1',
    mode: 'candy',
    candy: '0',
    targetLevel: '30',
    expToNext: '',
  }
}

/** Compute the result of one plan; null when its input is invalid. */
function calcPlan(plan: Plan, boost: Boost): PlanResult | null {
  const pokemon = findPokemon(plan.pokemonName)
  if (!pokemon) {
    return null
  }
  const v = validatePlan(plan, pokemon.exp)
  if (!v.isValid || v.currentLevel === null || v.expGot === null) {
    return null
  }
  const input = {
    expType: pokemon.exp,
    nature: plan.nature,
    boost,
    currentLevel: v.currentLevel,
  }
  if (plan.mode === 'candy') {
    const r = calcByCandy(input, v.candy ?? 0, v.expGot)
    return { level: r.level, candy: r.candyUsed, shards: r.shards }
  }
  const targetLevel = v.targetLevel ?? v.currentLevel
  const r = calcByTargetLevel(input, targetLevel, v.expGot)
  return { level: targetLevel, candy: r.candy, shards: r.shards }
}

/** レベル上げゆめのかけら計算 */
function LevelPage() {
  const [boost, setBoost] = useState<Boost>('none')
  const [isCompact, setIsCompact] = useState(false)
  const [plans, setPlans] = useState<Plan[]>(() => [newPlan()])

  const results = plans.map((plan) => calcPlan(plan, boost))
  // Totals are unknown while any plan has invalid input.
  const allValid = results.every((r) => r !== null)
  const totalCandy = allValid ? results.reduce((sum, r) => sum + (r?.candy ?? 0), 0) : null
  const totalShards = allValid ? results.reduce((sum, r) => sum + (r?.shards ?? 0), 0) : null

  const updatePlan = (updated: Plan) =>
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  const deletePlan = (id: number) => setPlans((prev) => prev.filter((p) => p.id !== id))
  const addPlan = () => setPlans((prev) => [...prev, newPlan()])

  return (
    <ToolPage tool={tools.levelUpShards}>
      <div className="plan-toolbar mb-4">
        <div className="field mb-0">
          <label className="label is-small">ブースト</label>
          <div className="buttons has-addons">
            {boosts.map((b) => (
              <button
                key={b.value}
                type="button"
                className={`button is-small ${boost === b.value ? 'is-link is-selected' : ''}`}
                aria-pressed={boost === b.value}
                onClick={() => setBoost(b.value)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="button is-small"
          aria-pressed={isCompact}
          onClick={() => setIsCompact((v) => !v)}
        >
          {isCompact ? '編集に戻る' : '一覧モード'}
        </button>
      </div>

      {isCompact ? (
        <table className="table is-narrow is-fullwidth plan-summary-table">
          <thead>
            <tr>
              <th>ポケモン</th>
              <th className="has-text-centered">性格</th>
              <th className="has-text-right">Lv</th>
              <th className="has-text-right">到達</th>
              <th className="has-text-right">次のレベルまで</th>
              <th className="has-text-right">アメ</th>
              <th className="has-text-right">かけら</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, i) => (
              <LevelUpPlanSummary key={plan.id} plan={plan} result={results[i]} />
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <div className="plan-list">
            {plans.map((plan, i) => (
              <LevelUpPlanCard
                key={plan.id}
                plan={plan}
                result={results[i]}
                onChange={updatePlan}
                onDelete={() => deletePlan(plan.id)}
              />
            ))}
          </div>
          <button
            type="button"
            className="button is-small"
            aria-label="育成予定を追加"
            onClick={addPlan}
          >
            ＋
          </button>
        </>
      )}
      <nav className="level is-mobile mt-5 plan-totals" aria-label="合計">
        <div className="level-item has-text-centered">
          <div>
            <p className="heading">アメ合計</p>
            <p className="title is-5">{totalCandy?.toLocaleString('ja-JP') ?? '---'}</p>
          </div>
        </div>
        <div className="level-item has-text-centered">
          <div>
            <p className="heading">ゆめのかけら合計</p>
            <p className="title is-5">{totalShards?.toLocaleString('ja-JP') ?? '---'}</p>
          </div>
        </div>
      </nav>
    </ToolPage>
  )
}

export default LevelPage
