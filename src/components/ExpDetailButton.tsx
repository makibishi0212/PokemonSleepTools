import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'
import DraftInput from './DraftInput.tsx'

type Props = {
  /** EXP still needed for the next level ('' = not set) */
  value: string
  onChange: (value: string) => void
  /** EXP required from the current level to the next (0 = unavailable, e.g. max level) */
  maxExp: number
  /** true when the current value is out of range */
  isInvalid: boolean
}

/**
 * Gear button next to the level input. Opens a small panel to enter how much EXP
 * is still needed for the next level, so leveling can start mid-level.
 */
function ExpDetailButton({ value, onChange, maxExp, isInvalid }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isSet = value.trim() !== ''
  const disabled = maxExp <= 0

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  const buttonClass = [
    'exp-detail-button',
    isInvalid ? 'has-text-danger' : isSet ? 'has-text-link' : '',
  ].join(' ')
  const tooltip = isInvalid
    ? '次のレベルまでのEXPが範囲外です'
    : isSet
      ? `次のレベルまで あと ${value} EXP`
      : '詳細設定: 次のレベルまでのEXP'

  return (
    <div ref={rootRef} className={`dropdown is-right exp-detail ${isOpen ? 'is-active' : ''}`}>
      <div className="dropdown-trigger">
        <button
          type="button"
          className={buttonClass}
          aria-label="経験値の詳細設定"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          data-tooltip={isOpen ? undefined : tooltip}
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
        >
          <FontAwesomeIcon icon={faGear} aria-hidden="true" />
        </button>
      </div>
      <div className="dropdown-menu" role="dialog" aria-label="経験値の詳細設定">
        <div className="dropdown-content p-3 exp-detail-panel">
          <p className="is-size-7 mb-1">次のレベルまで あと</p>
          <div className="field has-addons mb-1">
            <div className="control">
              <DraftInput
                className={`input is-small exp-input ${isInvalid ? 'is-danger' : ''}`}
                type="text"
                inputMode="numeric"
                aria-label="次のレベルまでに必要なEXP"
                aria-invalid={isInvalid}
                placeholder={String(maxExp)}
                value={value}
                onCommit={onChange}
              />
            </div>
            <div className="control">
              <span className="button is-small is-static">EXP</span>
            </div>
          </div>
          <p className="help">1〜{maxExp.toLocaleString('ja-JP')}。未設定ならレベルアップ直後として計算します。</p>
          {isSet && (
            <button type="button" className="button is-small is-text px-0" onClick={() => onChange('')}>
              クリア
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpDetailButton
