import { findPokemon } from '../data/pokemons.ts'
import { expToNextLevel } from '../util/levelUp.ts'
import { type Plan, type PlanMode, type PlanResult, validatePlan } from '../util/plan.ts'
import DraftInput from './DraftInput.tsx'
import ExpDetailButton from './ExpDetailButton.tsx'
import NatureSelect from './NatureSelect.tsx'
import PokemonSelect from './PokemonSelect.tsx'

type Props = {
  plan: Plan
  /** null when the plan has invalid input */
  result: PlanResult | null
  onChange: (plan: Plan) => void
  onDelete: () => void
}

const modes: readonly { value: PlanMode; label: string }[] = [
  { value: 'candy', label: 'アメの個数' },
  { value: 'target', label: '目標レベル' },
]

/** Placeholder shown instead of a result while input is invalid. */
const INVALID = '---'

function format(n: number): string {
  return n.toLocaleString('ja-JP')
}

function LevelUpPlanCard({ plan, result, onChange, onDelete }: Props) {
  const update = (patch: Partial<Plan>) => onChange({ ...plan, ...patch })
  const expType = findPokemon(plan.pokemonName)?.exp ?? 600
  const validation = validatePlan(plan, expType)
  const expToNextMax =
    validation.currentLevel === null ? 0 : expToNextLevel(validation.currentLevel, expType)
  const inputClass = (valid: boolean) => `input is-small ${valid ? '' : 'is-danger'}`

  return (
    <div className="box plan-card">
      <div className="plan-card-main">
        {/* Row 1: Pokémon, nature, current level */}
        <div className="plan-card-row">
          <PokemonSelect
            value={plan.pokemonName}
            onChange={(pokemonName) => update({ pokemonName })}
          />

          <div className="plan-card-field">
            <span className="plan-card-label">性格</span>
            <NatureSelect value={plan.nature} onChange={(nature) => update({ nature })} />
          </div>

          <div className="plan-card-field">
            <span className="plan-card-label">現在LV・EXP</span>
            {/* Bulma "input with icon" pattern; the right icon is the EXP detail gear */}
            <div className="control has-icons-right level-control">
              <DraftInput
                className={`${inputClass(validation.currentLevel !== null)} level-input`}
                type="text"
                inputMode="numeric"
                aria-label="現在のレベル"
                value={plan.currentLevel}
                aria-invalid={validation.currentLevel === null}
                // A new level makes the mid-level EXP meaningless, so clear it.
                onCommit={(currentLevel) => update({ currentLevel, expToNext: '' })}
              />
              <span className="icon is-small is-right exp-detail-icon">
                <ExpDetailButton
                  value={plan.expToNext}
                  maxExp={expToNextMax}
                  isInvalid={validation.expGot === null}
                  onChange={(expToNext) => update({ expToNext })}
                />
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: how much to level up */}
        <div className="plan-card-row">
          <div className="select is-small mode-select">
            <select
              value={plan.mode}
              aria-label="指定方法"
              onChange={(e) => update({ mode: e.target.value as PlanMode })}
            >
              {modes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {plan.mode === 'target' ? (
            <>
              <DraftInput
                className={`${inputClass(validation.targetLevel !== null)} level-input plan-card-amount`}
                type="text"
                inputMode="numeric"
                aria-label="目標レベル"
                aria-invalid={validation.targetLevel === null}
                value={plan.targetLevel}
                onCommit={(targetLevel) => update({ targetLevel })}
              />
            </>
          ) : (
            <>
              <DraftInput
                className={`${inputClass(validation.candy !== null)} candy-input plan-card-amount`}
                type="text"
                inputMode="numeric"
                aria-label="アメの個数"
                aria-invalid={validation.candy === null}
                value={plan.candy}
                onCommit={(candy) => update({ candy })}
              />
            </>
          )}
        </div>
      </div>

      {/* Right: computed results */}
      <div className={`plan-card-results ${result ? '' : 'has-text-danger'}`}>
        {plan.mode === 'target' ? (
          <div className="plan-card-result">
            <span className="plan-card-label">消費アメ数</span>
            <span className="plan-card-result-value">{result ? format(result.candy) : INVALID}</span>
          </div>
        ) : (
          <div className="plan-card-result">
            <span className="plan-card-label">到達レベル</span>
            <span className="plan-card-result-value">{result ? result.level : INVALID}</span>
          </div>
        )}
        <div className="plan-card-result">
          <span className="plan-card-label">ゆめのかけら</span>
          <span className="plan-card-result-value is-shards">
            {result ? format(result.shards) : INVALID}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="delete plan-card-delete"
        aria-label="この育成予定を削除"
        onClick={onDelete}
      />
    </div>
  )
}

export default LevelUpPlanCard
