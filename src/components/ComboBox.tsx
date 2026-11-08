import { useId, useState } from 'react'

type Props<T> = {
  /** All candidates */
  items: readonly T[]
  /** Key of the selected item */
  value: string
  onChange: (key: string) => void
  getKey: (item: T) => string
  /** Text shown for an item (and matched against the query) */
  getLabel: (item: T) => string
  /** Extra texts matched against the query, e.g. the English name */
  getSearchTexts?: (item: T) => readonly string[]
  ariaLabel: string
  placeholder?: string
  /** Extra class on the root (e.g. to set the width) */
  className?: string
}

/** Max candidates listed at once. */
const MAX_ITEMS = 40

/** Lower-case and fold hiragana into katakana so either script matches. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
    .replace(/\s+/g, '')
}

/**
 * Combobox: free text input that filters the candidate list.
 * Typing does not change the selection; picking a candidate (click / Enter) does.
 */
function ComboBox<T>({
  items,
  value,
  onChange,
  getKey,
  getLabel,
  getSearchTexts,
  ariaLabel,
  placeholder,
  className = '',
}: Props<T>) {
  // null = not editing; the selected item's label is shown.
  const [query, setQuery] = useState<string | null>(null)
  const [highlight, setHighlight] = useState(0)
  const listId = useId()

  const selected = items.find((item) => getKey(item) === value)
  const isOpen = query !== null

  const filter = (q: string): T[] => {
    const n = normalize(q)
    if (n === '') return items.slice(0, MAX_ITEMS)
    return items
      .filter((item) =>
        [getLabel(item), ...(getSearchTexts?.(item) ?? [])].some((t) => normalize(t).includes(n)),
      )
      .slice(0, MAX_ITEMS)
  }
  const candidates = isOpen ? filter(query) : []

  const select = (item: T) => {
    onChange(getKey(item))
    setQuery(null)
  }

  const close = () => setQuery(null)

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // While an IME composition is in progress (e.g. typing Japanese), Enter / arrows
    // belong to the IME. keyCode 229 covers browsers that do not set isComposing.
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return
    }
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setQuery('')
        setHighlight(0)
        e.preventDefault()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        setHighlight((h) => Math.min(h + 1, candidates.length - 1))
        e.preventDefault()
        break
      case 'ArrowUp':
        setHighlight((h) => Math.max(h - 1, 0))
        e.preventDefault()
        break
      case 'Enter':
        if (candidates[highlight]) select(candidates[highlight])
        e.preventDefault()
        break
      case 'Escape':
        close()
        e.preventDefault()
        break
    }
  }

  return (
    <div className={`dropdown combobox ${className} ${isOpen ? 'is-active' : ''}`}>
      <div className="dropdown-trigger">
        <input
          className="input is-small"
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder={placeholder}
          value={query ?? (selected ? getLabel(selected) : value)}
          onFocus={(e) => {
            setQuery('')
            setHighlight(0)
            e.target.select()
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlight(0)
          }}
          onBlur={close}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="dropdown-menu" id={listId} role="listbox">
        <div className="dropdown-content combobox-list">
          {candidates.length === 0 ? (
            <div className="dropdown-item has-text-grey">該当なし</div>
          ) : (
            candidates.map((item, i) => (
              <button
                key={getKey(item)}
                type="button"
                role="option"
                aria-selected={getKey(item) === value}
                className={`dropdown-item combobox-option ${i === highlight ? 'is-active' : ''}`}
                // mousedown would blur the input (closing the list) before click fires
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => select(item)}
              >
                {getLabel(item)}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ComboBox
