import { faBarsProgress, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { findPokemon } from '../data/pokemons.ts'
import { type Plan, type PlanMode, type PlanResult, parseLevel, validatePlan } from '../util/plan.ts'
import DraftInput from './DraftInput.tsx'
import LevelExpPanel from './LevelExpPanel.tsx'
import NatureSelect from './NatureSelect.tsx'
import PokemonSelect from './PokemonSelect.tsx'

type Props = {
  plan: Plan
  /** null when the plan has invalid input */
  result: PlanResult | null
  onChange: (plan: Plan) => void
  onDelete: () => void
  /** Swap with the card above / below; undefined when there is none */
  onMoveUp?: () => void
  onMoveDown?: () => void
}

const modes: readonly { value: PlanMode; label: string }[] = [
  { value: 'candy', label: 'アメの個数' },
  { value: 'target', label: '目標レベル' },
]

/** Placeholder shown instead of a result while input is invalid. */
const INVALID = '---'

/** A target below the current level makes no sense; raise it to the current level. */
function clampTarget(targetLevel: string, currentLevel: string): string {
  const target = parseLevel(targetLevel)
  const current = parseLevel(currentLevel)
  return target !== null && current !== null && target < current ? String(current) : targetLevel
}

function format(n: number): string {
  return n.toLocaleString('ja-JP')
}

function LevelUpPlanCard({ plan, result, onChange, onDelete, onMoveUp, onMoveDown }: Props) {
  const update = (patch: Partial<Plan>) => onChange({ ...plan, ...patch })
  const expType = findPokemon(plan.pokemonName)?.exp ?? 600
  const validation = validatePlan(plan, expType)
  const [isLevelPanelOpen, setIsLevelPanelOpen] = useState(false)
  const hasExpDetail = plan.expToNext.trim() !== ''
  const levelInvalid = validation.currentLevel === null || validation.expGot === null
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
            {/* Looks like an input with a right icon; clicking opens the level/EXP panel below */}
            <div className={`dropdown is-right level-dropdown ${isLevelPanelOpen ? 'is-active' : ''}`}>
              <div className="dropdown-trigger control has-icons-right level-control">
                <button
                  type="button"
                  className={`input is-small level-display ${levelInvalid ? 'is-danger' : ''}`}
                  aria-label="現在のレベルと次のレベルまでのEXPを設定"
                  aria-haspopup="dialog"
                  aria-expanded={isLevelPanelOpen}
                  data-tooltip={
                    hasExpDetail && !isLevelPanelOpen
                      ? `次のレベルまで あと ${plan.expToNext} EXP`
                      : undefined
                  }
                  onClick={() => setIsLevelPanelOpen((open) => !open)}
                >
                  {plan.currentLevel || '-'}
                </button>
                <span
                  className={`icon is-small is-right ${
                    validation.expGot === null ? 'has-text-danger' : hasExpDetail ? 'has-text-info' : ''
                  }`}
                >
                  <FontAwesomeIcon icon={faBarsProgress} aria-hidden="true" />
                </span>
              </div>
              {isLevelPanelOpen && (
                <LevelExpPanel
                  expType={expType}
                  level={plan.currentLevel}
                  expToNext={plan.expToNext}
                  onSave={(currentLevel, expToNext) => {
                    update({
                      currentLevel,
                      expToNext,
                      targetLevel: clampTarget(plan.targetLevel, currentLevel),
                    })
                    setIsLevelPanelOpen(false)
                  }}
                  onClose={() => setIsLevelPanelOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Row 2: how much to level up */}
        <div className="plan-card-row">
          <div className="select is-small mode-select">
            <select
              value={plan.mode}
              aria-label="指定方法"
              onChange={(e) =>
                update({
                  mode: e.target.value as PlanMode,
                  targetLevel: clampTarget(plan.targetLevel, plan.currentLevel),
                })
              }
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
                onCommit={(targetLevel) =>
                  update({ targetLevel: clampTarget(targetLevel, plan.currentLevel) })
                }
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
            <span className="plan-card-label">到達LV</span>
            <span className="plan-card-result-value">{result ? result.level : INVALID}</span>
          </div>
        )}
        <div className="plan-card-result">
          <span className="plan-card-label">かけら</span>
          <span className="plan-card-result-value">
            {result ? format(result.shards) : INVALID}
          </span>
        </div>
      </div>

      {/* Top-right column: delete, then move up / down */}
      <div className="plan-card-controls">
        <button type="button" className="delete" aria-label="この育成予定を削除" onClick={onDelete} />
        <button
          type="button"
          className="plan-card-move"
          aria-label="上の育成予定と入れ替え"
          disabled={!onMoveUp}
          onClick={onMoveUp}
        >
          <FontAwesomeIcon icon={faChevronUp} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="plan-card-move"
          aria-label="下の育成予定と入れ替え"
          disabled={!onMoveDown}
          onClick={onMoveDown}
        >
          <FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default LevelUpPlanCard
