import { findPokemon } from '../data/pokemons.ts'
import { natureInfo } from '../util/levelUp.ts'
import { type Plan, type PlanResult, validatePlan } from '../util/plan.ts'

type Props = {
  plan: Plan
  /** null when the plan has invalid input */
  result: PlanResult | null
}

const INVALID = '---'

function format(n: number): string {
  return n.toLocaleString('ja-JP')
}

/** Read-only table row of a plan (compact mode, for screenshots). */
function LevelUpPlanSummary({ plan, result }: Props) {
  const pokemon = findPokemon(plan.pokemonName)
  const nature = natureInfo(plan.nature)
  // EXP still needed for the next level; the whole requirement when not set.
  const expToNext = pokemon ? validatePlan(plan, pokemon.exp).expToNext : null
  return (
    <tr className={result ? '' : 'has-text-danger'}>
      <td className="plan-summary-name">{pokemon?.nameJa ?? plan.pokemonName}</td>
      <td className="has-text-centered" aria-label={nature.label}>
        {nature.icon}
      </td>
      {/* Current level → level after leveling, e.g. "64 → 67" */}
      <td className="has-text-right">
        {plan.currentLevel || INVALID} → {result ? result.level : INVALID}
      </td>
      <td className="has-text-right">
        {expToNext === null ? INVALID : expToNext > 0 ? format(expToNext) : '-'}
      </td>
      <td className="has-text-right">{result ? format(result.candy) : INVALID}</td>
      <td className="has-text-right">{result ? format(result.shards) : INVALID}</td>
    </tr>
  )
}

export default LevelUpPlanSummary
