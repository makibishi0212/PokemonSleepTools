import { type Pokemon, pokemons } from '../data/pokemons.ts'
import ComboBox from './ComboBox.tsx'

type Props = {
  /** Selected Pokémon (English name) */
  value: string
  onChange: (name: string) => void
}

const getKey = (p: Pokemon) => p.name
const getLabel = (p: Pokemon) => p.nameJa
const getSearchTexts = (p: Pokemon) => [p.name]

/** Combobox for picking a Pokémon by Japanese (or English) name. */
function PokemonSelect({ value, onChange }: Props) {
  return (
    <ComboBox
      className="pokemon-select"
      items={pokemons}
      value={value}
      onChange={onChange}
      getKey={getKey}
      getLabel={getLabel}
      getSearchTexts={getSearchTexts}
      ariaLabel="ポケモン"
      placeholder="ポケモン名"
    />
  )
}

export default PokemonSelect
