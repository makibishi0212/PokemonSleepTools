import { useId, useState } from 'react'
import { findPokemon, type Pokemon, pokemons } from '../data/pokemons.ts'

type Props = {
  /** Selected Pokémon (English name) */
  value: string
  onChange: (name: string) => void
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

function filterPokemons(query: string): Pokemon[] {
  const q = normalize(query)
  if (q === '') return pokemons.slice(0, MAX_ITEMS)
  return pokemons
    .filter((p) => normalize(p.nameJa).includes(q) || normalize(p.name).includes(q))
    .slice(0, MAX_ITEMS)
}

/**
 * Combobox for picking a Pokémon: free text input that filters the candidate list.
 * Typing does not change the selection; picking a candidate (click / Enter) does.
 */
function PokemonSelect({ value, onChange }: Props) {
  // null = not editing; the selected name is shown.
  const [query, setQuery] = useState<string | null>(null)
  const [highlight, setHighlight] = useState(0)
  const listId = useId()

  const selected = findPokemon(value)
  const isOpen = query !== null
  const candidates = isOpen ? filterPokemons(query) : []

  const select = (p: Pokemon) => {
    onChange(p.name)
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
    <div className={`dropdown pokemon-select ${isOpen ? 'is-active' : ''}`}>
      <div className="dropdown-trigger">
        <input
          className="input is-small"
          type="text"
          role="combobox"
          aria-label="ポケモン"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="ポケモン名"
          value={query ?? selected?.nameJa ?? value}
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
        <div className="dropdown-content pokemon-select-list">
          {candidates.length === 0 ? (
            <div className="dropdown-item has-text-grey">該当なし</div>
          ) : (
            candidates.map((p, i) => (
              <button
                key={p.name}
                type="button"
                role="option"
                aria-selected={p.name === value}
                className={`dropdown-item pokemon-option ${i === highlight ? 'is-active' : ''}`}
                // mousedown would blur the input (closing the list) before click fires
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => select(p)}
              >
                {p.nameJa}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default PokemonSelect
