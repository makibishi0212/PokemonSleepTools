import { useEffect, useRef, useState } from 'react'
import type { ExpType } from '../data/pokemons.ts'
import { expToNextLevel, maxLevel, minLevel } from '../util/levelUp.ts'
import { parseLevel } from '../util/plan.ts'

type Props = {
  expType: ExpType
  /** Current values */
  level: string
  expToNext: string
  /** Called with the new values when the user confirms */
  onSave: (level: string, expToNext: string) => void
  onClose: () => void
}

/**
 * Small panel (shown under the level field) to edit the current level and,
 * optionally, the EXP still needed for the next level.
 */
function LevelExpPanel({ expType, level, expToNext, onSave, onClose }: Props) {
  const [levelDraft, setLevelDraft] = useState(level)
  const [expDraft, setExpDraft] = useState(expToNext)
  const rootRef = useRef<HTMLDivElement>(null)

  const parsedLevel = parseLevel(levelDraft)
  const required = parsedLevel === null ? 0 : expToNextLevel(parsedLevel, expType)
  const expText = expDraft.trim()
  const parsedExp = /^\d+$/.test(expText) ? Number(expText) : null
  const expValid =
    expText === '' || (required > 0 && parsedExp !== null && parsedExp >= 1 && parsedExp <= required)
  const canSave = parsedLevel !== null && expValid

  const save = () => {
    if (!canSave) return
    onSave(levelDraft.trim(), expText)
  }

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) save()
  }

  return (
    <div ref={rootRef} className="dropdown-menu level-exp-panel" role="dialog" aria-label="現在LV・EXP">
      <div className="dropdown-content p-3">
        <div className="field mb-2">
          <label className="label is-small mb-1" htmlFor="level-exp-panel-level">
            現在のレベル
          </label>
          <div className="control">
            <input
              id="level-exp-panel-level"
              className={`input is-small ${parsedLevel === null ? 'is-danger' : ''}`}
              type="text"
              inputMode="numeric"
              autoFocus
              value={levelDraft}
              onChange={(e) => {
                setLevelDraft(e.target.value)
                // A different level makes the remaining EXP meaningless.
                if (e.target.value.trim() !== level.trim()) setExpDraft('')
              }}
              onKeyDown={onEnter}
            />
          </div>
          {parsedLevel === null && (
            <p className="help is-danger">
              {minLevel}〜{maxLevel} の整数を入力してください
            </p>
          )}
        </div>

        <div className="field mb-2">
          <label className="label is-small mb-1" htmlFor="level-exp-panel-exp">
            次のレベルまで あと（任意）
          </label>
          <div className="field has-addons mb-1">
            <div className="control">
              <input
                id="level-exp-panel-exp"
                className={`input is-small ${expValid ? '' : 'is-danger'}`}
                type="text"
                inputMode="numeric"
                placeholder={required > 0 ? String(required) : ''}
                disabled={required <= 0}
                value={expDraft}
                onChange={(e) => setExpDraft(e.target.value)}
                onKeyDown={onEnter}
              />
            </div>
            <div className="control">
              <span className="button is-small is-static">EXP</span>
            </div>
          </div>
          <p className={`help ${expValid ? '' : 'is-danger'}`}>
            {required > 0
              ? `1〜${required.toLocaleString('ja-JP')}。未入力ならレベルアップ直後として計算。`
              : parsedLevel === null
                ? 'レベルを入力すると範囲が表示されます。'
                : '最大レベルのため設定できません。'}
          </p>
        </div>

        <div className="buttons are-small mb-0">
          <button type="button" className="button is-link" disabled={!canSave} onClick={save}>
            OK
          </button>
          <button type="button" className="button" onClick={onClose}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}

export default LevelExpPanel
