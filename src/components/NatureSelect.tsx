import { useEffect, useRef, useState } from 'react'
import { type Nature, natureInfo, natures } from '../util/levelUp.ts'

type Props = {
  value: Nature
  onChange: (nature: Nature) => void
}

/**
 * Compact nature picker: a single icon button; the other choices appear
 * in a dropdown while it is open.
 */
function NatureSelect({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = natureInfo(value)

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

  const select = (nature: Nature) => {
    onChange(nature)
    setIsOpen(false)
  }

  return (
    <div ref={rootRef} className={`dropdown nature-select ${isOpen ? 'is-active' : ''}`}>
      <div className="dropdown-trigger">
        <button
          type="button"
          className="button is-small nature-button"
          aria-label={`性格: ${current.label}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          data-tooltip={isOpen ? undefined : current.description}
          onClick={() => setIsOpen((open) => !open)}
        >
          {current.icon}
        </button>
      </div>
      <div className="dropdown-menu" role="listbox" aria-label="性格">
        <div className="dropdown-content">
          {natures.map((n) => (
            <button
              key={n.value}
              type="button"
              role="option"
              aria-selected={n.value === value}
              className={`dropdown-item nature-option ${n.value === value ? 'is-active' : ''}`}
              onClick={() => select(n.value)}
            >
              <span className="nature-option-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NatureSelect
